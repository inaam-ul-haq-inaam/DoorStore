/**
 * Product categories aur per-category units — single source of truth.
 *
 * AddProductScreen, EditProductScreen aur InventoryScreen (filter) yahan se
 * istemal karte hain; customer HomeScreen ki category pills bhi inhi naam se
 * Firestore ke `products.category` values se map hoti hain.
 */

export const CATEGORY_OPTIONS = [
  'Vegetables',
  'Fruits',
  'Meat',
  'Grocery Items',
  'Spices & Masala',
  'Washing & Cleaning',
];

/**
 * Category ke hisaab se unit choices (shopkeeper requirement).
 * Un categories jinke liye alag list nahi hai, DEFAULT_UNITS fallback chalta hai.
 */
const CATEGORY_UNITS: Record<string, string[]> = {
  'Grocery Items': ['KG', 'Gram', 'Liter', 'Pack', 'Dozen'],
  'Spices & Masala': ['Pack', 'Box', 'Gram'],
  'Washing & Cleaning': ['Piece', 'Pack', 'Bottle'],
};

/** Purane broad categories (Vegetables/Fruits/Meat) ke liye legacy list. */
const DEFAULT_UNITS = ['Kg', 'Grams', 'Dozen', 'Pcs', 'Pack', 'Litre', 'ml'];

export function unitsForCategory(category?: string): string[] {
  return (category && CATEGORY_UNITS[category]) || DEFAULT_UNITS;
}
