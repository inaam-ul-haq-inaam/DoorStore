/**
 * Buyer status-update notifications — admin/shopkeeper side helper.
 *
 * Jab staff kisi order ka status badalta hai (accept / on delivery /
 * delivered / cancel), admin app buyer ka device token Firestore se utha
 * kar Vercel backend par POST karta hai (`/api/notify-buyer`):
 *
 * 1. Admin order ka status update karta hai (OrdersScreen / OrderDetailsScreen).
 * 2. Ye helper `orders/{orderId}.customer_id` (ya direct pass kiya customer)
 *    se buyer uid leta hai → `users/{uid}.fcm_tokens` (staff sab users ke
 *    docs parh sakta hai — firestore.rules).
 * 3. Har token ke liye backend par POST — backend status ke hisaab se
 *    title/body decide karta hai (single source of truth, trusted side).
 *
 * API URL root `.env` ke `BUYER_NOTIFY_API_URL` se aata hai. `@env` values
 * bundle time par inline hote hain, is liye .env change ke baad Metro ko
 * `--reset-cache` ke saath restart karo.
 */

import firestore from '@react-native-firebase/firestore';
import { BUYER_NOTIFY_API_URL, NOTIFICATION_SECRET } from '@env';

const REQUEST_TIMEOUT_MS = 8000;

const withTimeout = <T>(task: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    task,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Notification request timed out.')), ms),
    ),
  ]);

/** Ek device token ke liye backend call. Reject hone par upar warn hota hai. */
async function postForToken(
  token: string,
  orderId: string,
  status: string,
): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (NOTIFICATION_SECRET) {
    headers['x-notification-secret'] = NOTIFICATION_SECRET;
  }

  const response = await withTimeout(
    fetch(BUYER_NOTIFY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fcmToken: token,
        orderId: String(orderId),
        status: String(status),
      }),
    }),
    REQUEST_TIMEOUT_MS,
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Backend responded ${response.status}: ${detail.slice(0, 200)}`);
  }
}

const extractTokens = (data: unknown): string[] => {
  const stored = (data as { fcm_tokens?: unknown } | undefined)?.fcm_tokens;
  return Array.isArray(stored)
    ? stored.filter((t): t is string => typeof t === 'string' && t.length > 0)
    : [];
};

/**
 * Status update ke FORAN BAAD call karo. YE FUNCTION KABHI THROW NAHI KARTA
 * aur await karne ki zaroorat nahi — notification fail hona admin ka order
 * flow kabhi block ya break nahi karna chahiye.
 */
export function notifyBuyerOfStatusChange(
  orderId: string,
  status: string,
  customerId?: string,
): void {
  (async () => {
    if (!BUYER_NOTIFY_API_URL) {
      console.warn('[buyer-notify] BUYER_NOTIFY_API_URL is not set in .env, skipping notification');
      return;
    }

    try {
      let buyerUid = customerId || '';

      if (!buyerUid) {
        // Customer id order doc se lo (edit orders ho sakte hain staff side se)
        const orderSnap = await firestore().doc(`orders/${orderId}`).get();
        buyerUid = String(orderSnap.data()?.customer_id || '');
      }

      if (!buyerUid) {
        console.log(`[buyer-notify] order ${orderId}: no customer_id, skipping notification`);
        return;
      }

      const userSnap = await firestore().doc(`users/${buyerUid}`).get();
      const tokens = extractTokens(userSnap.data());

      if (tokens.length === 0) {
        console.log(`[buyer-notify] order ${orderId}: buyer ${buyerUid} has no device tokens, skipping`);
        return;
      }

      const results = await Promise.allSettled(
        tokens.map((token) => postForToken(token, orderId, status)),
      );

      const sent = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`[buyer-notify] order ${orderId} (${buyerUid}): ${sent}/${results.length} notification(s) sent`);

      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn('[buyer-notify] send failed:', (result.reason as Error)?.message || result.reason);
        }
      });
    } catch (error) {
      console.warn('[buyer-notify] failed:', (error as Error)?.message || error);
    }
  })();
}
