# Door Store — Notification Backend

A tiny Node.js + Express backend that sends **Firebase Cloud Messaging (FCM)** push notifications for the DoorStore React Native app. It is deployed on **Vercel** (free Hobby plan) so you do **not** need the Firebase **Blaze** plan to send server-side notifications.

```
Buyer app (makes order)  ──POST /api/send-notification──▶  backend on Vercel  ──firebase-admin──▶  FCM  ──▶  Admin/Shopkeeper phone
```

What it is used for today:

- After a buyer successfully places an order, the app (see `src/services/orderNotification.ts`) reads the staff device tokens from the Firestore doc `settings/admin_fcm_tokens` and POSTs them here with `title: "New Order Received!"` and `body: "A buyer just placed a new order."`. Tap the notification and the app opens the order (`data.orderId`).

## Endpoints

| Method | Path                   | Purpose                                          |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/`                    | Sanity check — returns `{ ok: true, ... }`       |
| GET    | `/api/health`          | Health check (pings backend uptime)              |
| POST   | `/api/send-notification` | Send a push notification (see below)           |
| POST   | `/api/notify-buyer`      | Notify buyer of an order-status change (below) |

### `POST /api/send-notification`

Request body (JSON):

```json
{
  "fcmToken": "dKf8...",                       // one device token (or use fcmTokens)
  "fcmTokens": ["dKf8...", "e2A9..."],         // optional: multiple device tokens
  "title": "New Order Received!",
  "body": "A buyer just placed a new order.",
  "data": { "orderId": "abc123", "type": "new_order" },  // optional passthrough
  "androidChannelId": "orders"                 // optional override
}
```

Response:

```json
{ "success": true, "messageId": "projects/doorstore-xxxxx/messages/...", "sent": 1, "failed": 0 }
```

For an array of tokens the result contains per-token outcomes in `results`.

### `POST /api/notify-buyer`

Two-way flow: jab staff buyer ke order ka status badalta hai, admin app
buyer ka `users/{uid}.fcm_tokens` se token uthata hai (staff rules ke mutabiq
users parh sakta hai) aur yahan POST karta hai. Backend status ke hisaab se
title/body khud derive karta hai (single source of truth).

Request body (JSON):

```json
{
  "fcmToken": "e70y...",                 // one buyer device token (or use fcmTokens)
  "fcmTokens": ["e70y...", "aB3..."],    // optional: multiple device tokens
  "orderId": "oQhcSXyz",                 // goes into data payload for tap handling
  "status": "pending"                    // pending | on_delivery | completed | cancelled
}
```

Status → copy (server side):

| status        | title                   | body                                       |
| ------------- | ----------------------- | ------------------------------------------ |
| `pending`     | Order Accepted!         | Your order has been accepted and is being prepared. |
| `on_delivery` | Order Out for Delivery! | Your order is on its way to your address.  |
| `completed`   | Order Delivered!        | Your order has been delivered. Enjoy your fresh items! |
| `cancelled`   | Order Cancelled!        | Your order has been cancelled. Contact the store for any questions. |

Response:

```json
{ "success": true, "sent": 1, "failed": 0, "results": [{ "ok": true, "messageId": "..." }] }
```

Unknown `status` → `400` with the list of valid statuses.

---

## Step 1 — Prerequisites

- Node.js **18+** installed (you already have RN 0.86 tooling, so you're fine).
- A free **Vercel** account (https://vercel.com/signup — sign in with GitHub/email). The Hobby plan is free and enough for this — **no Firebase Blaze needed, no credit card**.
- The DoorStore Firebase project (you already have it — the app runs).

## Step 2 — Get the Firebase Service Account Key (and stringify it)

The service account is the "server key" that lets this backend talk to Firebase Cloud Messaging on behalf of your project. It must never be committed to git or shipped inside the app.

1. Open the Firebase Console → https://console.firebase.google.com
2. Select your **DoorStore** project.
3. Click the ⚙️ **Project Settings** (gear icon) → **Service accounts** tab.
4. Make sure **Firebase Admin SDK** snippet is selected (Node.js is default).
5. Click **Generate new private key** → **Generate key**. A JSON file downloads. Save it **inside the `doorstore-backend` folder** as `serviceAccountKey.json`:

   ```
   E:\Work\DoorStore\doorstore-backend\serviceAccountKey.json
   ```

   (This file is already gitignored — `doorstore-backend/.gitignore` ignores it.)

6. **Stringify it** — the raw JSON is multi-line, but the `.env` value must be ONE line. Run this from *inside* the `doorstore-backend` folder:

   **PowerShell (Windows):**
   ```powershell
   node -e 'console.log(JSON.stringify(require("./serviceAccountKey.json")))'
   ```

   **cmd (Windows):**
   ```cmd
   node -e "console.log(JSON.stringify(require('./serviceAccountKey.json')))"
   ```

   **bash / macOS / Linux:**
   ```bash
   node -e 'console.log(JSON.stringify(require("./serviceAccountKey.json")))'
   ```

7. Copy that single-line output. Create a `.env` file in `doorstore-backend` (copy `.env.example` first) and paste it after `FIREBASE_SERVICE_ACCOUNT=` with **no quotes around the value**:

   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"doorstore-xxxxx","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@doorstore-xxxxx.iam.gserviceaccount.com",...}
   ```

   `JSON.stringify` escapes the PEM newlines as literal `\n`, and the server converts them back automatically — paste exactly as printed.

   Optionally automate (writes/creates `.env` in one shot, works in any shell):

   ```bash
   node -e "const fs=require('fs');const k=JSON.stringify(require('./serviceAccountKey.json'));let e=fs.existsSync('.env')?fs.readFileSync('.env','utf8'):'';if(!/FIREBASE_SERVICE_ACCOUNT=/.test(e)){e+=(e?'\n':'')+'FIREBASE_SERVICE_ACCOUNT='+k+'\n';fs.writeFileSync('.env',e);console.log('Added to .env');}else console.log('FIREBASE_SERVICE_ACCOUNT already set in .env');"
   ```

## Step 3 — Run locally

From inside `doorstore-backend`:

```bash
npm install
npm run dev
```

You should see:

```
Door Store notification backend listening on http://localhost:3000
```

Quick sanity check (that the server itself is alive):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health
```

Get the admin token to test the full path:

1. Open Firestore Console → your `settings` collection → doc **`admin_fcm_tokens`** → copy a token from the `fcm_tokens` array.
   - No doc there yet? Open the DoorStore app once while logged in as **admin** (or shopkeeper) — the app registers the device and the mirror doc gets created. You can also just place a real order from the buyer account and watch the log.

2. Send a test notification:

   **PowerShell:**
   ```powershell
   $token = "PASTE_TOKEN_HERE"
   Invoke-RestMethod -Uri http://localhost:3000/api/send-notification `
     -Method Post -ContentType 'application/json' `
     -Body (@{ fcmToken = $token; title = "Test"; body = "Ping from backend" } | ConvertTo-Json)
   ```

   **bash:**
   ```bash
   curl -X POST http://localhost:3000/api/send-notification \
     -H 'Content-Type: application/json' \
     -d '{"fcmToken":"PASTE_TOKEN_HERE","title":"Test","body":"Ping from backend"}'
   ```

   (Skip adding the `x-notification-secret` header if you enabled `NOTIFICATION_SECRET` — see Security section.)

3. A push notification should pop up on that device (if the DoorStore app is running in background — foreground shows it through notifee).

> ℹ️ Emulator/phone testing against your PC:
> - **Android emulator** uses `http://10.0.2.2:3000` instead of `localhost`.
> - **Physical phone on the same WiFi** (or USB with `adb reverse tcp:3000 tcp:3000`) needs your PC's LAN IP, e.g. `http://192.168.1.5:3000`.
> - The app reads the endpoint from the **root** `.env` (`ORDER_NOTIFY_API_URL`) — change it there and restart Metro with `--reset-cache` (env values are inlined at bundle time).

## Step 4 — Deploy to Vercel

(Recommended: deploy using CLI — do this from *inside* the `doorstore-backend` folder)

```bash
npm install -g vercel    # one time
vercel login             # one time — opens browser / email flow
```

Now **cd into the backend folder and deploy**:

```bash
cd doorstore-backend
vercel
```

Answer the prompts exactly like this:

| Prompt | Answer |
| ------ | ------ |
| Set up and deploy `E:\Work\DoorStore\doorstore-backend`? | **Y** |
| Which scope? | your personal account |
| Link to existing project? | **N** |
| What's your project's name? | **doorstore-backend** (or anything unique — globally URL becomes `<name>.vercel.app`) |
| In which directory is your code located? | **./ (the current directory)** — confirms `doorstore-backend` is its own root |

⚠️ Deploy the **backend folder as its own project root** — do not link the repo root `E:\Work\DoorStore`, otherwise everything (node_modules, android/, ios/) would be uploaded.

Then add the service account env var for **production**:

```bash
vercel env add FIREBASE_SERVICE_ACCOUNT production
```

Paste the SAME one-line stringified JSON from Step 2 and press Enter. (Or add it through the dashboard: https://vercel.com → your project → **Settings → Environment Variables** → key `FIREBASE_SERVICE_ACCOUNT`, value = the single-line JSON.)

Optional: if you enable the shared-secret guard, also add `NOTIFICATION_SECRET` here (and the same value to the app's root `.env`).

Finally, deploy to production:

```bash
vercel --prod
```

You'll get a URL like `https://doorstore-backend-xxxxx.vercel.app`. Verify it:

- Open `https://<your-url>/api/health` in a browser → should return `{"ok": true, ...}`.
- Test the endpoint:
  ```bash
  curl -X POST https://<your-url>/api/send-notification -H 'Content-Type: application/json' -d '{"fcmToken":"PASTE_TOKEN","title":"Hello","body":"From Vercel!"}'
  ```

Later deploys are just:

```bash
cd doorstore-backend
vercel --prod
```

> First request after a quiet period may take ~1–2s (serverless cold start). This is normal and free-tier behavior.

### Last piece — connect your app to the live URL ✅ (done — live URL below)

> Your project went live at **https://doorstore-backend.vercel.app** — the root `.env` already points
> `ORDER_NOTIFY_API_URL=https://doorstore-backend.vercel.app/api/send-notification`.
> (Local fallback if you ever need it: `http://localhost:3000/api/send-notification` — see "running locally".)

Open the **root** `.env` of the React Native project and change:

```
ORDER_NOTIFY_API_URL=https://<your-vercel-project>.vercel.app/api/send-notification
```

then restart Metro (`npx react-native start --reset-cache`) and rebuild the app. Done ✅

---

## Security notes (please read)

- `serviceAccountKey.json` / the `FIREBASE_SERVICE_ACCOUNT` value = **full admin access to your Firebase project** (database bypasses ALL Firestore rules). protect it like a password:
  - never commit it (both `.gitignore`s handle it),
  - never ship it inside the mobile app,
  - rotate it (Firebase Console → Service accounts → delete & regenerate) if it leaks.
- The endpoint is public. A random person could spam notification texts to your admin devices if they knew a token. To harden, set `NOTIFICATION_SECRET` in the Vercel env AND the app's root `.env` (same value). The backend then rejects any request missing header `x-notification-secret: <value>`.
- The staff tokens are mirrored in Firestore at `settings/admin_fcm_tokens` so the *buyer app* can trigger the request. FCM tokens alone cannot be used to send notifications (requires the Firebase project's server credentials), and Firestore rules only let **staff** write that doc.

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| 500 & log `FIREBASE_SERVICE_ACCOUNT is not set` | Env var not added on Vercel (or `.env` missing locally). Add it and redeploy. |
| 500 & log `not valid JSON` | The value was broken into multiple lines. Regenerate the one-liner (Step 2.6). |
| `messaging/registration-token-not-registered` or `invalid-registration-token` in response | That device token went stale (uninstalled app/logout). Remove it from `settings/admin_fcm_tokens`; fresh tokens replace it on next app-login. |
| Nothing received on admin device | Check the device is actually registered (app opened once as admin/shopkeeper, notification permission granted on Android 13+). Tap the notification to see if it navigates (foreground shows it via notifee; background via system tray). |
| Order placed but no push | Look at Metro logs for `[order-notify]` lines — the failure reason is printed |
| Duplicate notifications | You still have the old **Cloud Function `newOrderNotification` deployed**, and/or **`order-notifier-daemon.js`** is running locally. Undeploy the function (`firebase functions:delete newOrderNotification`) and stop the daemon. |
| Missing env error when building app (`can't read ORDER_NOTIFY_API_URL`) | Formal: the root `.env` needs the new keys we added — copy from `.env.example`. |
| Emulator `localhost` unreachable | Emulator's localhost is itself: use `http://10.0.2.2:3000` in the root `.env`. |

## Files here

```
doorstore-backend/
├── api/
│   └── index.js        # Express app — Vercel serverless function entry
├── .env.example        # template for .env (FIREBASE_SERVICE_ACCOUNT + optional secret)
├── .gitignore          # keeps .env / serviceAccountKey.json / node_modules / .vercel out of git
├── package.json        # express, firebase-admin, cors, dotenv
├── vercel.json         # rewrite: every request routes to /api/index
└── README.md           # this file
```
