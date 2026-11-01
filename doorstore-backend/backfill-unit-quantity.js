/**
 * One-off backfill: order items me `unit_quantity` missing hai (cart products
 * ab se pehle is field ke baghair map hue the). Product docs me field mojood
 * hai ("250"/"500" strings). Ye script har order ke items ko product se match
 * karke sirf missing `unit_quantity` bhar deta hai — baaqi data untouched.
 *
 * Match order: item.id (product id) -> fallback item.name.
 * Dry-run default; run with APPLY=1 to actually write.
 */
const admin = require('firebase-admin');
const svc = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const APPLY = process.env.APPLY === '1';

(async () => {
  // 1) Products load karo (id + name dono index par)
  const pById = new Map();
  const pByName = new Map();
  const prodSnap = await db.collection('products').get();
  prodSnap.docs.forEach(d => {
    const v = d.data();
    pById.set(d.id, v);
    if (v.name) pByName.set(String(v.name).trim().toLowerCase(), v);
  });
  console.log('products loaded:', prodSnap.size);

  // 2) Orders scan
  const orders = await db.collection('orders').get();
  let ordersUpdated = 0, itemsFilled = 0, unmatched = 0;

  for (const od of orders.docs) {
    const data = od.data();
    const items = data.items || [];
    let changed = false;
    const newItems = items.map(it => {
      if (!it || !(it.unit_quantity === undefined || it.unit_quantity === null)) return it;
      let p = it.id ? pById.get(it.id) : undefined;
      if (!p && it.name) p = pByName.get(String(it.name).trim().toLowerCase());
      if (p && p.unit_quantity !== undefined && p.unit_quantity !== null) {
        changed = true;
        itemsFilled++;
        return { ...it, unit_quantity: p.unit_quantity };
      }
      unmatched++;
      return it;
    });
    if (changed) {
      if (APPLY) {
        try {
          await od.ref.update({ items: newItems });
          await new Promise(r => setTimeout(r, 150));
        } catch (werr) {
          console.error('[fail] order', od.id, '-', werr.message || werr);
          process.exitCode = 1;
        }
      } else {
        console.log('[dry] would update order', od.id, '->', itemsFilled, 'item(s)');
      }
      ordersUpdated++;
    }
  }

  console.log(`APPLY=${APPLY} | orders affected: ${ordersUpdated} | items filled: ${itemsFilled} | unmatched: ${unmatched}`);
  process.exit(0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
