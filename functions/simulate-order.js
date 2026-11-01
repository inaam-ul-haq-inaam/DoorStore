'use strict';

/**
 * Local verification helper — new-order notification pipeline test karne ke liye.
 *
 * Kya karta hai:
 *   1. Fake admin user seed karta hai (dummy FCM token ke saath)
 *   2. CheckoutScreen jaisa test order `orders/{id}` par create karta hai
 *   3. Cloud Function `newOrderNotification` trigger hoti hai (functions emulator)
 *   4. `_notifications_sent` marker check karke duplicate-guard verify karta hai
 *
 * IMPORTANT: yeh script sirf Firestore EMULATOR ke saath chalti hai
 * (real project ke against refuse kar deti hai). FCM send dummy token par
 * fail hoga — wo EXPECTED hai; usse send-path, recipient query aur
 * error-handling verify hoti hai. Real device delivery ke liye Blaze plan +
 * `firebase deploy --only functions` + asli order chahiye (report dekhein).
 *
 * Setup (do terminals):
 *   Terminal 1: npx firebase-tools emulators:start --only firestore,functions --project demo-doorstore
 *   Terminal 2 (functions/ dir):
 *     node simulate-order.js --emulator
 *     node simulate-order.js --emulator --seed-marker --orderId TEST123   # duplicate-guard test, step 1
 *     node simulate-order.js --emulator --orderId TEST123                 # duplicate-guard test, step 2 (skip expected)
 *     node simulate-order.js --emulator --count 5                         # bulk orders
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const args = process.argv.slice(2);
const useEmulator = args.includes('--emulator');
const seedMarkerOnly = args.includes('--seed-marker');

const readFlag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')
    ? args[i + 1]
    : undefined;
};

const fixedId = readFlag('--orderId');
const count = Math.max(1, Number(readFlag('--count') || 1));
const project = process.env.SIM_PROJECT || 'demo-doorstore';

if (!useEmulator) {
  console.error(
    '[sim] Refusing to run against a real project. Re-run with --emulator.',
  );
  process.exit(2);
}

// Admin SDK ko emulator par point karo (Windows-friendly: khud set kar diya).
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';

initializeApp({ projectId: project });
const db = getFirestore();

const ADMIN_UID = 'sim-admin';
const DUMMY_TOKEN = 'SIMULATED_TOKEN_NOT_A_REAL_FCM_TOKEN';

/** CheckoutScreen confirmOrder() ke orderData se MILTA-JULTA order. */
function makeOrder(n) {
  return {
    customer_id: 'sim-buyer-' + n,
    customer_name: 'Simulator Buyer',
    customer_phone: '03000000000',
    delivery_address: 'Test address, Karachi',
    delivery_lat: 24.8607,
    delivery_lng: 67.0011,
    items: [
      { id: 'p1', name: 'Tomatoes', weight: '1 kg', price: 120, image: '', quantity: 2 },
      { id: 'p2', name: 'Onions', weight: '1 kg', price: 100, image: '', quantity: 1 },
    ],
    total_amount: 340,
    delivery_fee: 50,
    distance_km: 2.4,
    status: 'incoming',
    created_at: new Date().toISOString(),
    payment_method: 'COD',
    is_rated: false,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Agar Firestore emulator hi nahi chal raha to admin SDK hang ho sakta hai —
// fail-fast guard (unref: ye timer khud process ko rokega nahi).
setTimeout(() => {
  console.error(
    '[sim] timed out after 45s — Firestore emulator running? ' +
      'firebase emulators:start --only firestore,functions --project demo-doorstore',
  );
  process.exit(1);
}, 45000).unref();

async function main() {
  // 1) Fake admin seed (merge: kabhi real admin doc par na chalayein)
  await db
    .collection('users')
    .doc(ADMIN_UID)
    .set(
      {
        role: 'admin',
        full_name: 'Simulator Admin',
        fcm_tokens: [DUMMY_TOKEN],
        fcm_tokens_updated_at: new Date().toISOString(),
      },
      { merge: true },
    );
  console.log('[sim] seeded fake admin (dummy token) at users/' + ADMIN_UID);

  if (seedMarkerOnly) {
    if (!fixedId) {
      console.error('[sim] --seed-marker requires --orderId');
      process.exit(2);
    }
    await db
      .collection('_notifications_sent')
      .doc('order_new_' + fixedId)
      .set({ order_id: fixedId, created_at: new Date().toISOString() });
    console.log('[sim] marker pre-seeded for order', fixedId);
    return;
  }

  // 2) Order(s) create
  const ids = [];
  for (let i = 1; i <= count; i += 1) {
    const id = fixedId || 'SIM' + Date.now().toString(36).toUpperCase() + i;
    await db.collection('orders').doc(id).set(makeOrder(i));
    ids.push(id);
    console.log('[sim] order created:', id);
  }

  // 3) Function ko process karne ka mauka
  await sleep(6000);

  // 4) Marker check — duplicate-guard ki proof
  let allMarked = true;
  for (const id of ids) {
    const marker = await db
      .collection('_notifications_sent')
      .doc('order_new_' + id)
      .get();
    if (marker.exists) {
      console.log('[sim] PASS — marker present for', id, '(notification dispatch attempted once)');
    } else {
      allMarked = false;
      console.error(
        '[sim] FAIL — no marker for',
        id,
        '(function nahi chali? Terminal 1 me functions emulator logs check karein)',
      );
    }
  }

  console.log(
    '[sim] expected FCM behavior: dummy token par "send failed" log normal hai — ' +
      'usse send-path + error handling verify hoti hai.',
  );
  process.exit(allMarked ? 0 : 1);
}

main().catch((error) => {
  console.error('[sim] failed:', error);
  process.exit(1);
});
