/**
 * Door Store notification backend (Vercel serverless + Express).
 *
 * Single responsibility: receive `{ fcmToken, title, body }` and send the
 * push notification through Firebase Cloud Messaging (FCM) using the
 * firebase-admin SDK.
 *
 * Why this exists: the Firebase Spark (free) plan cannot run Cloud Functions
 * with outbound HTTPS, so notification sending lives here on Vercel instead.
 *
 * Security:
 * - The service account is NEVER committed. It is injected at runtime via the
 *   `FIREBASE_SERVICE_ACCOUNT` env var (a stringified service-account JSON —
 *   see README.md).
 * - Optional shared-secret guard: if `NOTIFICATION_SECRET` is set on the
 *   server, requests must carry the same value in the `x-notification-secret`
 *   header.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 3000;

/** Android notification channel id — must match the app (NOTIFICATIONS_CHANNEL_ID). */
const DEFAULT_ANDROID_CHANNEL_ID = 'orders';

// ---------------------------------------------------------------------------
// Lazy firebase-admin bootstrap (from the FIREBASE_SERVICE_ACCOUNT env var)
// ---------------------------------------------------------------------------

let cachedMessaging = null;
let initError = null;

/**
 * Initializes admin SDK on first use and caches the Messaging instance.
 * Throws with a clear, actionable message when configuration is broken —
 * every request then fails with a 500 that says exactly what to fix.
 */
function getMessaging() {
  if (cachedMessaging) return cachedMessaging;
  if (initError) throw initError;

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw || raw.trim() === '') {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT is not set. Put your stringified service-account JSON in the environment (see README.md).'
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch (parseError) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT is not valid JSON. It must be the service-account JSON stringified onto ONE line (see README.md).'
      );
    }

    // Vercel/dashboard editors sometimes turn real newlines in the PEM key
    // into literal "\n" sequences — restore them.
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    for (const field of ['project_id', 'client_email', 'private_key']) {
      if (!serviceAccount[field]) {
        throw new Error(`FIREBASE_SERVICE_ACCOUNT JSON is missing the "${field}" field.`);
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    cachedMessaging = admin.messaging();
    console.log(`[init] firebase-admin ready for project "${serviceAccount.project_id}"`);
    return cachedMessaging;
  } catch (error) {
    initError = error;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

app.use(cors());
app.use(express.json());

/** Sanity check for browser / curl — open https://<your-app>.vercel.app/ */
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Door Store notification backend' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'Door Store notification backend', uptime: process.uptime() });
});

/**
 * POST /api/send-notification
 * Body:
 *   fcmToken        string          one device token (required, or use fcmTokens)
 *   fcmTokens       string[]        multiple device tokens (optional)
 *   title           string          notification title
 *   body            string          notification body
 *   data            object          optional key/value passthrough (values stringified);
 *                                   app uses data.orderId to open the order on tap
 *   androidChannelId string         optional Android channel override (default "orders")
 *
 * Response (single token):
 *   { "success": true, "messageId": "projects/..." }
 * Response (multiple tokens):
 *   { "success": true, "sent": 2, "failed": 0, "results": [...] }
 */
app.post('/api/send-notification', async (req, res) => {
  try {
    // Optional shared-secret guard (see README.md -> Security)
    const secret = process.env.NOTIFICATION_SECRET;
    if (secret && req.get('x-notification-secret') !== secret) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { fcmToken, fcmTokens, title, body, data, androidChannelId } = req.body || {};

    // Accept a single token (fcmToken) and/or an array (fcmTokens) — deduped.
    const raw = Array.isArray(fcmTokens) ? fcmTokens : [];
    if (typeof fcmTokens === 'string' && fcmTokens.trim() !== '') raw.push(fcmTokens);
    if (typeof fcmToken === 'string' && fcmToken.trim() !== '') raw.push(fcmToken);
    const tokens = [...new Set(raw.map((t) => String(t).trim()).filter(Boolean))];

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipient. Provide "fcmToken" (string) or "fcmTokens" (array of strings).',
      });
    }

    const notificationTitle =
      typeof title === 'string' && title.trim() !== '' ? title.trim().slice(0, 250) : 'Door Store';
    const notificationBody =
      typeof body === 'string' && body.trim() !== '' ? body.trim().slice(0, 500) : 'You have a new update.';

    // FCM data payload values must be strings.
    const dataPayload = {};
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) dataPayload[key] = String(value);
      }
    }

    const channelId =
      typeof androidChannelId === 'string' && androidChannelId.trim() !== ''
        ? androidChannelId.trim()
        : DEFAULT_ANDROID_CHANNEL_ID;

    const messaging = getMessaging();

    const messageBase = {
      // notification payload => Android/iOS system tray shows it automatically
      // when the app is in background/terminated.
      notification: { title: notificationTitle, body: notificationBody },
      // data payload => the app reads data.orderId on tap and opens the order.
      ...(Object.keys(dataPayload).length > 0 ? { data: dataPayload } : {}),
      android: {
        priority: 'high',
        notification: { channelId },
      },
    };

    if (tokens.length === 1) {
      const messageId = await messaging.send({ ...messageBase, token: tokens[0] });
      return res.json({ success: true, messageId, sent: 1, failed: 0 });
    }

    const response = await messaging.sendEachForMulticast({ ...messageBase, tokens });
    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      results: response.responses.map((r) =>
        r.success
          ? { ok: true, messageId: r.messageId }
          : { ok: false, error: (r.error && (r.error.errorInfo?.code || r.error.code)) || 'unknown' }
      ),
    });
  } catch (error) {
    console.error('[send-notification] failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send notification.',
    });
  }
});

// 404 for anything else (rewrites send every path here)

/**
 * Status -> buyer-visible copy. Kept on the trusted side so any status-change
 * wording change needs only a backend redeploy.
 */
const BUYER_STATUS_COPY = {
  pending: {
    title: 'Order Accepted!',
    body: 'Your order has been accepted and is being prepared.',
  },
  on_delivery: {
    title: 'Order Out for Delivery!',
    body: 'Your order is on its way to your address.',
  },
  completed: {
    title: 'Order Delivered!',
    body: 'Your order has been delivered. Enjoy your fresh items!',
  },
  cancelled: {
    title: 'Order Cancelled!',
    body: 'Your order has been cancelled. Contact the store for any questions.',
  },
};

/**
 * POST /api/notify-buyer
 * Body:
 *   fcmToken        string   one buyer device token (required, or use fcmTokens)
 *   fcmTokens       string[] multiple buyer device tokens (optional)
 *   orderId         string   order id (goes into the data payload for tap handling)
 *   status          string   new status: pending | on_delivery | completed | cancelled
 *
 * Title/body are derived from `status` on the server so the copy stays
 * consistent no matter which client triggers it.
 *
 * Response:
 *   { "success": true, "sent": 1, "failed": 0 }
 */
app.post('/api/notify-buyer', async (req, res) => {
  try {
    const secret = process.env.NOTIFICATION_SECRET;
    if (secret && req.get('x-notification-secret') !== secret) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { fcmToken, fcmTokens, orderId, status } = req.body || {};

    const raw = Array.isArray(fcmTokens) ? fcmTokens : [];
    if (typeof fcmTokens === 'string' && fcmTokens.trim() !== '') raw.push(fcmTokens);
    if (typeof fcmToken === 'string' && fcmToken.trim() !== '') raw.push(fcmToken);
    const tokens = [...new Set(raw.map((t) => String(t).trim()).filter(Boolean))];

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipient. Provide "fcmToken" (string) or "fcmTokens" (array of strings).',
      });
    }

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing "orderId" (string).' });
    }

    const copy = BUYER_STATUS_COPY[String(status)];
    if (!copy) {
      return res.status(400).json({
        success: false,
        error: `Unknown status "${String(status)}". Expected one of: ${Object.keys(BUYER_STATUS_COPY).join(', ')}.`,
      });
    }

    const messaging = getMessaging();
    const messageBase = {
      notification: { title: copy.title, body: copy.body },
      // Tap handler: buyer-side open karta hai orders screen (type order_status).
      data: { orderId: String(orderId), type: 'order_status', status: String(status) },
      android: {
        priority: 'high',
        notification: { channelId: DEFAULT_ANDROID_CHANNEL_ID },
      },
    };

    const response = await messaging.sendEachForMulticast({ ...messageBase, tokens });
    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      results: response.responses.map((r) =>
        r.success
          ? { ok: true, messageId: r.messageId }
          : { ok: false, error: (r.error && (r.error.errorInfo?.code || r.error.code)) || 'unknown' }
      ),
    });
  } catch (error) {
    console.error('[notify-buyer] failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to send notification.',
    });
  }
});

// 404 for anything else (rewrites send every path here)
app.use((_req, res) => {
  res
    .status(404)
    .json({ success: false, error: 'Not found. Use POST /api/send-notification or POST /api/notify-buyer.' });
});

// Malformed JSON body / unexpected errors -> clean JSON, never an HTML stack trace
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body.' });
  }
  console.error('[unhandled]', error);
  return res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Local development only — on Vercel the module is imported, not run directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Door Store notification backend listening on http://localhost:${PORT}`);
    console.log(`Try: curl -X POST http://localhost:${PORT}/api/send-notification ...`);
  });
}

// Vercel's Node runtime wraps this Express app as the serverless handler.
module.exports = app;
