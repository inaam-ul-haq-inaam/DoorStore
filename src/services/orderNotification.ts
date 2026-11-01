/**
 * "New order" push notifications for staff (admin/shopkeeper) devices —
 * triggered from the buyer side through the DoorStore notification backend
 * (`doorstore-backend/`, deployed on Vercel).
 *
 * Flow:
 * 1. Buyer places an order (CheckoutScreen) → yahan fire-and-forget call hoti hai.
 * 2. Staff device tokens `users/{uid}.fcm_tokens` me store hote hain, lekin
 *    Firestore rules buyers ko doosre users ke docs padhne se rokte hain —
 *    is liye `notifications.ts` in tokens ka readable mirror
 *    `/settings/admin_fcm_tokens` par maintain karta hai (logged-in user
 *    ke liye readable).
 * 3. Ye helper mirror doc se tokens uthata hai aur har token ke liye backend
 *    par POST karta hai. Backend firebase-admin se FCM bhejta hai — token tap
 *    par app `AdminApp > OrderDetail` kholti hai (data.orderId).
 *
 * API URL root `.env` ke `ORDER_NOTIFY_API_URL` se aata hai (local dev:
 * http://localhost:3000/api/send-notification — deploy ke baad Vercel URL
 * par swap karo). `@env` values bundle time par inline hote hain, is liye
 * change ke baad Metro ko `--reset-cache` ke saath restart karo.
 */

import firestore from '@react-native-firebase/firestore';
import { ORDER_NOTIFY_API_URL, NOTIFICATION_SECRET } from '@env';

export const ORDER_NOTIFICATION_TITLE = 'New Order Received!';
export const ORDER_NOTIFICATION_BODY = 'A buyer just placed a new order.';

/** Staff tokens ka shared mirror doc (notifications.ts isse sync karta hai). */
const STAFF_TOKEN_DOC_PATH = 'settings/admin_fcm_tokens';

const REQUEST_TIMEOUT_MS = 8000;

const withTimeout = <T>(task: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    task,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Notification request timed out.')), ms),
    ),
  ]);

/** Ek device token ke liye backend call. Reject hone par upar warn hota hai. */
async function postForToken(token: string, orderId: string): Promise<void> {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (NOTIFICATION_SECRET) {
    headers['x-notification-secret'] = NOTIFICATION_SECRET;
  }

  const response = await withTimeout(
    fetch(ORDER_NOTIFY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fcmToken: token,
        title: ORDER_NOTIFICATION_TITLE,
        body: ORDER_NOTIFICATION_BODY,
        // Data payload — tap par app order screen kholti hai (client handler).
        data: { orderId: String(orderId), type: 'new_order' },
      }),
    }),
    REQUEST_TIMEOUT_MS,
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Backend responded ${response.status}: ${detail.slice(0, 200)}`);
  }
}

/**
 * OrderFirestore me save hone ke baad call karo. YE FUNCTION KABHI THROW NAHI
 * KARTA aur await karne ki zaroorat nahi — notification fail hona order flow
 * ko kabhi block ya break nahi karna chahiye.
 */
export function notifyStaffOfNewOrder(orderId: string): void {
  (async () => {
    if (!ORDER_NOTIFY_API_URL) {
      console.warn('[order-notify] ORDER_NOTIFY_API_URL is not set in .env, skipping notification');
      return;
    }

    try {
      const snapshot = await firestore().doc(STAFF_TOKEN_DOC_PATH).get();
      const stored = snapshot.data()?.fcm_tokens;
      const tokens: string[] = Array.isArray(stored)
        ? stored.filter((t): t is string => typeof t === 'string' && t.length > 0)
        : [];

      if (tokens.length === 0) {
        console.log('[order-notify] no staff tokens registered, skipping notification');
        return;
      }

      const results = await Promise.allSettled(
        tokens.map((token) => postForToken(token, orderId)),
      );

      const sent = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`[order-notify] order ${orderId}: ${sent}/${results.length} notification(s) sent`);

      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn('[order-notify] send failed:', (result.reason as Error)?.message || result.reason);
        }
      });
    } catch (error) {
      console.warn('[order-notify] failed:', (error as Error)?.message || error);
    }
  })();
}
