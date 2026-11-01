import { PermissionsAndroid, Platform } from 'react-native';
import messaging, {
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import { navigationRef } from '../navigation/navigationRef';

/**
 * Push notifications (FCM) for the DoorStore admin app.
 *
 * - Sirf logged-in ADMIN ke liye device token register hota hai (see configurePushNotifications).
 * - Token `users/{uid}.fcm_tokens` array me rakha jata hai (deduped + capped),
 *   takke ek admin ke zyada devices par notification ja sakein aur purane token prune hon.
 * - Backend (Cloud Function `newOrderNotification`) sirf `role == 'admin'` wale
 *   docs ke tokens par bhejta hai — recipient validation trusted side par hoti hai.
 * - Foreground me Notifee se notification dikhaya jata hai; background/terminated
 *   me FCM ka notification payload system tray me khud show hota hai.
 * - Token tap karo to `AdminApp > OrderDetail` (orderId) khulta hai.
 */

export const NOTIFICATIONS_CHANNEL_ID = 'orders';

/** Admin aur shopkeeper dono devices ko new-order notification milna chahiye */
const isEligibleRole = (role?: string): boolean =>
  role === 'admin' || role === 'shopkeeper';

/** Buyers bhi apne status-update notifications ke liye push par register hote hain. */
const canRegisterPush = (role?: string): boolean =>
  isEligibleRole(role) || role === 'buyer';

const MAX_TOKENS_PER_USER = 10;

let currentUid: string | null = null;
let currentToken: string | null = null;
let currentRole: string | null = null;
let listenersAttached = false;

const log = (...args: unknown[]) => console.log('[push]', ...args);

/** Logs me poora token kabhi print nahi — sirf chhota prefix. */
const masked = (token: string): string => `${token.slice(0, 12)}…${token.length}`;

/** Fire-and-forget wrapper — neeche ke dono helpers apne andar khud catch karte hain. */
const fireAndForget = (task: Promise<unknown>): void => {
  task.catch((error) => console.warn('[push] async task failed:', error));
};

const dataString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

// ---------------------------------------------------------------------------
// Permission + channel
// ---------------------------------------------------------------------------

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Android 13+ (API 33) par runtime POST_NOTIFICATIONS chahiye.
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        log('POST_NOTIFICATIONS denied on Android 13+');
        return false;
      }
    }

    const status = await messaging().requestPermission();
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.warn('[push] permission request failed:', error);
    return false;
  }
}

export async function ensureNotificationChannel(): Promise<string> {
  await notifee.createChannel({
    id: NOTIFICATIONS_CHANNEL_ID,
    name: 'Order alerts',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  return NOTIFICATIONS_CHANNEL_ID;
}

// ---------------------------------------------------------------------------
// Token storage — apne hi user doc par, kabhi kisi aur ka nahi
// ---------------------------------------------------------------------------

async function saveToken(uid: string, token: string): Promise<void> {
  try {
    const ref = firestore().collection('users').doc(uid);
    let staffRole = false;
    await firestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) {
        log('user doc missing, token not saved');
        return;
      }
      const data = snapshot.data() || {};
      // Belt & braces: staff (admin/shopkeeper) saved via saveToken; buyers register
      // apne device token save karwa rahe hain (status-update ke liye). Mirror doc sirf
      // staff ke liye sync hota hai — buyer token admin notification list me nahi jata.
      const staff = isEligibleRole(data.role);
      staffRole = staff;
      if (!isEligibleRole(data.role) && data.role !== 'buyer') {
        log('role is not push eligible, token not saved');
        return;
      }
      const existing: string[] = Array.isArray(data.fcm_tokens)
        ? data.fcm_tokens.filter((t: unknown): t is string => typeof t === 'string')
        : [];
      // Dedupe + refresh: naya token aage, purana hatao, max devices cap.
      const next = [token, ...existing.filter((t) => t !== token)].slice(
        0,
        MAX_TOKENS_PER_USER,
      );
      transaction.update(ref, {
        fcm_tokens: next,
        fcm_tokens_updated_at: firestore.FieldValue.serverTimestamp(),
      });
    });
    log('token saved:', masked(token));
    if (staffRole) {
      await syncSharedTokensDoc(token, 'add');
    }
  } catch (error) {
    console.warn('[push] saving token failed:', error);
  }
}

async function removeToken(uid: string, token: string): Promise<void> {
  try {
    const ref = firestore().collection('users').doc(uid);
    const snapshot = await ref.get();
    if (!snapshot.exists) return;
    const tokens = snapshot.data()?.fcm_tokens;
    if (!Array.isArray(tokens) || !tokens.includes(token)) return;
    await ref.update({ fcm_tokens: tokens.filter((t: unknown) => t !== token) });
    log('token removed for user:', uid);
    await syncSharedTokensDoc(token, 'remove');
  } catch (error) {
    console.warn('[push] removing token failed:', error);
  }
}

// ---------------------------------------------------------------------------
// Staff tokens ka shared mirror — buyer app readable
// ---------------------------------------------------------------------------

/**
 * `/settings/admin_fcm_tokens` — eligible (admin/shopkeeper) device tokens ka
 * readable mirror. Firestore rules buyers ko doosre users ke docs padhne se
 * rokte hain, magar buyer-side order flow ko tokens chahiye hote hain (Vercel
 * notification backend ko trigger karne ke liye — src/services/orderNotification.ts).
 * `settings` collection logged-in user ke liye readable hai, aur write kewal
 * staff kar sakta hai — aur ye sync sirf eligible roles wale devices par chalta hai.
 */
const SHARED_TOKENS_DOC = firestore().collection('settings').doc('admin_fcm_tokens');

const MAX_SHARED_TOKENS = 20;

async function syncSharedTokensDoc(token: string, mode: 'add' | 'remove'): Promise<void> {
  try {
    const snapshot = await SHARED_TOKENS_DOC.get();
    const data = snapshot.data();
    const existing: string[] = Array.isArray(data?.fcm_tokens)
      ? (data.fcm_tokens as unknown[]).filter((t): t is string => typeof t === 'string')
      : [];

    const next =
      mode === 'remove'
        ? existing.filter((t) => t !== token)
        : [token, ...existing.filter((t) => t !== token)].slice(0, MAX_SHARED_TOKENS);

    // No-op write se bacho (token pehle se isi state me hai)
    if (next.length === existing.length && next.every((t, i) => t === existing[i])) return;

    await SHARED_TOKENS_DOC.set(
      {
        fcm_tokens: next,
        fcm_tokens_updated_at: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    log('shared token doc synced:', mode);
  } catch (error) {
    console.warn('[push] syncing shared token doc failed:', error);
  }
}

// ---------------------------------------------------------------------------
// Foreground display + tap navigation
// ---------------------------------------------------------------------------

async function displayForegroundNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const title = remoteMessage.notification?.title;
  const body = remoteMessage.notification?.body;
  if (!title) return; // sirf payload wale message kaam ke hain

  try {
    await ensureNotificationChannel();
    const data: Record<string, string> = {};
    Object.entries(remoteMessage.data || {}).forEach(([key, value]) => {
      const str = dataString(value);
      if (str !== undefined) data[key] = str;
    });

    await notifee.displayNotification({
      id: remoteMessage.messageId || `msg_${Date.now()}`,
      title,
      body,
      data,
      android: {
        channelId: NOTIFICATIONS_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
    });
    log('foreground notification displayed');
  } catch (error) {
    console.warn('[push] foreground display failed:', error);
  }
}

function navigateToOrder(orderId: string): void {
  const buyerTap = currentRole === 'buyer';
  // Terminated → cold start par NavigationContainer ready + role registration
  // (AuthContext profile load) dono der se ho sakte hain — bounded wait (~6s).
  let attemptsLeft = 20;
  const tryNavigate = () => {
    if (!navigationRef.isReady() || !currentUid) {
      if (attemptsLeft-- > 0) {
        setTimeout(tryNavigate, 300);
        return;
      }
    }
    if (!navigationRef.isReady()) return; // nav hi available nahi — silently give up
    if (buyerTap) {
      // Buyer apni orders list par le jao (customer stack → Orders tab)
      navigationRef.navigate('CustomerApp', { screen: 'MainTabs', params: { screen: 'Orders' } });
      log('opened buyer orders from notification:', orderId);
    } else {
      navigationRef.navigate('AdminApp', {
        screen: 'OrderDetail',
        params: { orderId },
      });
      log('opened order from notification:', orderId);
    }
  };
  tryNavigate();
}

// ---------------------------------------------------------------------------
// Listeners (app lifetime — ek hi dafa attach hote hain)
// ---------------------------------------------------------------------------

export function attachPushListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;

  messaging().onTokenRefresh(async (token) => {
    currentToken = token;
    if (currentUid) {
      log('token refreshed:', masked(token));
      await saveToken(currentUid, token);
    }
  });

  messaging().onMessage(async (remoteMessage) => {
    if (currentUid) await displayForegroundNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    const orderId = dataString(remoteMessage.data?.orderId);
    if (orderId) navigateToOrder(orderId);
  });

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.PRESS) return;
    const orderId = dataString(detail.notification?.data?.orderId);
    if (orderId) navigateToOrder(orderId);
  });

  // App terminated se notification tap par kholta hai
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      const orderId = remoteMessage
        ? dataString(remoteMessage.data?.orderId)
        : undefined;
      if (orderId) navigateToOrder(orderId);
    })
    .catch(() => {});

  log('push listeners attached');
}

// ---------------------------------------------------------------------------
// Registration entry point — AppNavigator yahan call karta hai
// ---------------------------------------------------------------------------

export function configurePushNotifications(input: {
  uid: string | null;
  role?: string;
}): void {
  const { uid, role } = input;

  if (!uid || !canRegisterPush(role)) {
    // Logout / role change: is device ka token purane user doc se hata do
    // (warna doosre user ko galti se admin notifications jaate rahenge).
    const previousUid = currentUid;
    const previousToken = currentToken;
    currentUid = null;
    currentToken = null;
    currentRole = null;
    if (previousUid && previousToken) {
      fireAndForget(removeToken(previousUid, previousToken));
    }
    return;
  }

  if (currentUid === uid) {
    currentRole = role || null; // role switch case (same uid) — keep fresh
    return; // pehle se isi admin ke liye registered
  }

  if (currentUid && currentToken) {
    fireAndForget(removeToken(currentUid, currentToken));
  }
  currentUid = uid;
  currentRole = role || null;
  fireAndForget(registerCurrentDevice(uid));
}

async function registerCurrentDevice(uid: string): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    log('permission not granted — system tray notifications may be blocked');
  }
  await ensureNotificationChannel();

  try {
    const token = await messaging().getToken();
    currentToken = token;
    log('device token acquired:', masked(token));
    await saveToken(uid, token);
  } catch (error) {
    console.warn('[push] getToken failed:', error);
  }
}
