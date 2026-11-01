const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

/** Android 13+ default channel (manifest meta-data + client Notifee dono isi id use karte hain). */
const NOTIFICATION_CHANNEL = 'orders';

/** Purane/invalid tokens ko hata do taake har order par yahi error na aaye. */
const DEAD_TOKEN_CODES = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
];

function buildMessage(orderId, order, token) {
  const shortId = `#${String(orderId).slice(0, 6).toUpperCase()}`;
  const amount = Number(order.total_amount);
  const body =
    Number.isFinite(amount) && amount > 0
      ? `A new order has been placed. Order ID: ${shortId}. Amount: Rs. ${Math.round(amount).toLocaleString('en-IN')}.`
      : `A new order has been placed. Order ID: ${shortId}.`;

  return {
    token,
    // notification payload => background/terminated me system tray khud show karta hai
    notification: {
      title: 'New Order Received! 🛍️',
      body,
    },
    // data payload => tap par app order screen kholega (client handler)
    data: {
      orderId: String(orderId),
      type: 'new_order',
    },
    android: {
      priority: 'high',
      notification: { channelId: NOTIFICATION_CHANNEL },
    },
  };
}

/**
 * Firestore trigger: orders/{orderId} DOCUMENT CREATE par chalta hai —
 * yaani notification sirf tabhi jaata hai jab order safaltapoorvak save ho chuka ho.
 *
 * Duplicate-safety: `_notifications_sent/order_new_{orderId}` ko ek hi baar
 * create kiya jata hai (create() fails if exists) — trigger retries aur dobara
 * processing par dobara notification nahi jata.
 */
exports.newOrderNotification = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data ? event.data.data() : undefined;
  const orderId = event.params.orderId;
  if (!order) {
    console.log('[newOrder] created doc has no data, skipping', orderId);
    return;
  }

  // 1) Idempotency claim
  const markerRef = db.collection('_notifications_sent').doc(`order_new_${orderId}`);
  try {
    await markerRef.create({ order_id: orderId, created_at: new Date().toISOString() });
  } catch (error) {
    if (error && error.code === 6) {
      console.log('[newOrder] already notified, skipping', orderId);
      return;
    }
    console.error('[newOrder] marker create failed', error);
    throw error;
  }

  // 2) Recipient validation (trusted backend): SIRF admin role docs ke tokens.
  //    Buyers khud ko admin nahi bana sakte (firestore.rules), aur apne doc par
  //    rakh kar bhi kabhi yahan shamil nahi honge kyunki query role par based hai.
  const adminsSnapshot = await db
    .collection('users')
    .where('role', 'in', ['admin', 'shopkeeper'])
    .get();

  const targets = [];
  adminsSnapshot.forEach((doc) => {
    const tokens = doc.data().fcm_tokens;
    if (Array.isArray(tokens)) {
      tokens.forEach((token) => {
        if (typeof token === 'string' && token.length > 0) {
          targets.push({ uid: doc.id, token });
        }
      });
    }
  });

  if (targets.length === 0) {
    console.log('[newOrder] no admin FCM tokens registered, nothing to send', orderId);
    return;
  }

  // 3) Send (deduped tokens)
  const seenTokens = new Set();
  for (const target of targets) {
    if (seenTokens.has(target.token)) continue;
    seenTokens.add(target.token);

    try {
      await getMessaging().send(buildMessage(orderId, order, target.token));
      console.log(
        '[newOrder] sent for order',
        orderId,
        '→ user',
        target.uid,
        target.token.slice(0, 12) + '…',
      );
    } catch (error) {
      const code = (error && (error.errorInfo?.code || error.code)) || '';
      console.warn('[newOrder] send failed:', code || error);
      if (DEAD_TOKEN_CODES.includes(code)) {
        // Missing/expired token ko safe tareeqe se hata do (rules Admin SDK par lagti nahi).
        await db
          .collection('users')
          .doc(target.uid)
          .update({ fcm_tokens: FieldValue.arrayRemove(target.token) });
        console.log('[newOrder] pruned dead token for user', target.uid);
      }
    }
  }
});
