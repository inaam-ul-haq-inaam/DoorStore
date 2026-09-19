import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { firebaseDb } from '../../../services/firebase';
import { uploadImageToCloudinary } from '../../../services/cloudinary';
import { Alert } from 'react-native';

export const UNIT_OPTIONS = ['Kg', 'Grams', 'Dozen', 'Pcs', 'Pack'];
export const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Meat'];

type EditProductRoute = { EditProduct: { productId: string } };

export const useEditProductController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const route = useRoute<RouteProp<EditProductRoute, 'EditProduct'>>();
  const productId = route.params?.productId;

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [unitQuantity, setUnitQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) {
      Alert.alert('Error', 'Product ID missing.');
      navigation.goBack();
      return;
    }

    const unsubscribe = firebaseDb
      .collection('products')
      .doc(productId)
      .onSnapshot(
        doc => {
          if (doc.exists()) {
            const data = doc.data();
            // Live snapshot se sirf initial fill karte hain; user ke edits
            // overwrite na hon is liye bas pehli baar populate karte hain.
            setName(prev => prev || data?.name || '');
            setPrice(prev => prev || String(data?.price_pkr ?? ''));
            setStock(prev => prev || String(data?.stock_available ?? ''));
            setUnit(prev => (prev === 'Kg' ? data?.unit || 'Kg' : prev));
            setUnitQuantity(prev => (prev === '1' ? String(data?.unit_quantity ?? '1') : prev));
            setCategory(prev => (prev === 'Vegetables' ? data?.category || 'Vegetables' : prev));
            setDescription(prev => prev || data?.description || '');
            setImageUrl(prev => prev || data?.image_url || null);
          } else {
            Alert.alert('Error', 'Product not found.');
            navigation.goBack();
          }
          setLoadingProduct(false);
        },
        error => {
          console.error('Error loading product:', error);
          Alert.alert('Error', 'Failed to load product.');
          navigation.goBack();
          setLoadingProduct(false);
        }
      );

    return () => unsubscribe();
  }, [productId, navigation]);

  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.6, includeBase64: true }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImageUrl(response.assets[0].uri || null);
        setImageBase64(response.assets[0].base64 || null);
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!productId) return;
    if (!name.trim() || !price || !stock) {
      Alert.alert('Validation Error', 'Name, price and stock are required.');
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        price_pkr: parseFloat(price) || 0,
        stock_available: parseInt(stock, 10) || 0,
        unit,
        unit_quantity: unitQuantity || '1',
        category,
        updated_at: new Date().toISOString(),
      };

      // Agar naya image chuna hai to Cloudinary pe upload karke replace karo.
      if (imageBase64) {
        const downloadURL = await uploadImageToCloudinary(imageBase64);
        if (!downloadURL) throw new Error('Cloudinary returned empty URL');
        updates.image_url = downloadURL;
      } else if (imageUrl) {
        updates.image_url = imageUrl;
      }

      const firestorePromise = firebaseDb.collection('products').doc(productId).update(updates);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore took too long to respond (Timeout)!')), 10000);
      });

      await Promise.race([firestorePromise, timeoutPromise]);

      Alert.alert('Success', 'Product updated successfully!');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Inventory' }],
        })
      );
    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert('Error', error.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loadingProduct,
    name, setName,
    price, setPrice,
    stock, setStock,
    unit, setUnit,
    unitQuantity, setUnitQuantity,
    category, setCategory,
    description, setDescription,
    imageUrl, handleImagePick,
    saving, handleSaveChanges,
  };
};
