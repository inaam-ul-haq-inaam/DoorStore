/**
 * Order/cart item ki quantity ko readable label me format karta hai.
 *
 * Order items me `quantity` plain count hota hai aur product par `unit` +
 * `unit_quantity` (ek quantity kitne base units ka) hota hai — e.g. Grams
 * wale product par unit_quantity=250 aur quantity=4 => "1 Kg".
 *
 * Display rules:
 *   Grams/gram     -> grams me total, 1000+ par Kg me convert (e.g. "500 Gram", "1.5 Kg")
 *   Kg             -> direct "1 Kg", "2 Kg" (x1 ki jagah)
 *   ml             -> 1000+ par Liter, warna ml
 *   Liter/Litre    -> "1 Liter", "2 Liter"
 *   baqi (Pack, Dozen, Piece, Bottle, Box, Pcs...) -> "2 Pack", "1 Dozen"
 */

interface OrderItemLike {
  quantity?: number;
  unit?: string;
  unit_quantity?: number | string;
}

/** 1.0 -> "1", 1.50 -> "1.5", 0.75 -> "0.75" — trailing zeros hataata hai. */
function trimNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return String(Math.round(value * 100) / 100);
}

export function formatOrderItemQuantity(item: OrderItemLike): string {
  const qty = Number(item?.quantity ?? 1) || 0;
  const base = Number(item?.unit_quantity ?? 1) || 1;
  const unit = String(item?.unit || '').trim();
  const unitLower = unit.toLowerCase();

  if (unitLower === 'grams' || unitLower === 'gram') {
    const grams = qty * base;
    if (grams >= 1000) return `${trimNumber(grams / 1000)} Kg`;
    return `${trimNumber(grams)} Gram`;
  }

  if (unitLower === 'kg') {
    const kg = qty * base;
    return `${trimNumber(kg)} Kg`;
  }

  if (unitLower === 'ml') {
    const ml = qty * base;
    if (ml >= 1000) return `${trimNumber(ml / 1000)} Liter`;
    return `${trimNumber(ml)} ml`;
  }

  if (unitLower === 'liter' || unitLower === 'litre') {
    const liters = qty * base;
    return `${trimNumber(liters)} Liter`;
  }

  // Unit unknown/empty — purana fallback (bare count).
  if (!unit) return `x${trimNumber(qty)}`;
  return `${trimNumber(qty)} ${unit}`;
}
