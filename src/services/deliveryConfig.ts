import { firebaseDb, firebaseAuth } from './firebase';

/**
 * Delivery config (shop location + base/per-km fee) ek jagah rehti hai:
 *   settings/delivery
 *
 * Wajah: firestore.rules ke mutabik `users` collection ka doc sirf apna ya
 * staff padh sakta hai. Delivery fee calculate karne ke liye customer ko
 * shop location + fees chahiye, is liye pehle `users` pe query karna
 * (customer ke liye) rules se reject ho jata tha -> fee hamesha 0.
 * `settings/{docId}` sab logged-in users ke liye readable hai aur
 * staff hi likh sakta hai, is liye ye yahan rakhi gayi hai.
 */

export interface ShopLocationConfig {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DeliverySettingsConfig {
  base_fee: number;
  per_km_fee: number;
}

export interface DeliveryConfig {
  shopLocation: ShopLocationConfig | null;
  settings: DeliverySettingsConfig | null;
}

const CONFIG_COLLECTION = 'settings';
const CONFIG_DOC_ID = 'delivery';

const EMPTY_CONFIG: DeliveryConfig = { shopLocation: null, settings: null };

const toNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && !isNaN(parsed) ? parsed : null;
};

/** users doc mein purana data `lat/lng` bhi ho sakta hai — dono shapes accept karo. */
const normalizeShopLocation = (raw: any): ShopLocationConfig | null => {
  if (!raw) return null;

  const latitude = toNumber(raw.latitude ?? raw.lat);
  const longitude = toNumber(raw.longitude ?? raw.lng ?? raw.lon);
  if (latitude === null || longitude === null) return null;

  return {
    latitude,
    longitude,
    address: typeof raw.address === 'string' ? raw.address : undefined,
  };
};

const normalizeSettings = (raw: any): DeliverySettingsConfig | null => {
  if (!raw) return null;

  const baseFee = toNumber(raw.base_fee);
  const perKmFee = toNumber(raw.per_km_fee);
  if (baseFee === null && perKmFee === null) return null;

  return {
    base_fee: baseFee ?? 0,
    per_km_fee: perKmFee ?? 0,
  };
};

/**
 * `settings/delivery` se shop location + delivery settings padho.
 * Rules deny / network error hone pe bhi crash nahi karega — empty config wapas.
 */
export const readDeliveryConfig = async (): Promise<DeliveryConfig> => {
  try {
    const doc = await firebaseDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID).get();
    if (!doc.exists()) return EMPTY_CONFIG;

    const data = doc.data();
    return {
      shopLocation: normalizeShopLocation(data?.shop_location),
      settings: normalizeSettings(data?.delivery_settings),
    };
  } catch (error) {
    console.warn('Could not read delivery config (settings/delivery)', error);
    return EMPTY_CONFIG;
  }
};

/**
 * `settings/delivery` mein partial update likho (sirf staff ke liye allowed).
 */
export const writeDeliveryConfig = async (partial: {
  shop_location?: ShopLocationConfig;
  delivery_settings?: DeliverySettingsConfig;
}): Promise<void> => {
  await firebaseDb
    .collection(CONFIG_COLLECTION)
    .doc(CONFIG_DOC_ID)
    .set({ ...partial, updated_at: new Date().toISOString() }, { merge: true });
};

/**
 * Staff ke apne `users/{uid}` doc mein pehle se jo shop_location /
 * delivery_settings maujood hain, unhein `settings/delivery` mein copy kar do.
 * Isse purana data khud migrate ho jata hai — shopkeeper ko dobara save nahi karna padta.
 */
export const syncDeliveryConfigFromStaffDoc = async (uid?: string): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser;
    const userId = uid || user?.uid;
    if (!userId) return;

    const userDoc = await firebaseDb.collection('users').doc(userId).get();
    if (!userDoc.exists()) return;

    const staffData = userDoc.data();
    const shopLocation = normalizeShopLocation(staffData?.shop_location);
    const settings = normalizeSettings(staffData?.delivery_settings);

    if (!shopLocation && !settings) return;

    const current = await readDeliveryConfig();
    const partial: {
      shop_location?: ShopLocationConfig;
      delivery_settings?: DeliverySettingsConfig;
    } = {};

    if (shopLocation && !current.shopLocation) partial.shop_location = shopLocation;
    if (settings && !current.settings) partial.delivery_settings = settings;

    if (Object.keys(partial).length > 0) {
      await writeDeliveryConfig(partial);
    }
  } catch (error) {
    console.warn('Could not sync delivery config from staff profile', error);
  }
};
