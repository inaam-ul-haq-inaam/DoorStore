import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { uploadImageToCloudinary } from '../../../services/cloudinary';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export const useAddProductController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [unitQuantity, setUnitQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.6, includeBase64: true }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
        setImageBase64(response.assets[0].base64 || null);
      }
    });
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !stock || !imageUri || !imageBase64) {
      Alert.alert('Validation Error', 'Please fill all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error('Not authenticated');


      const downloadURL = await uploadImageToCloudinary(imageBase64);

      if (!downloadURL) throw new Error('Cloudinary returned empty URL');

      const sanitizedPrice = parseFloat(price) || 0;
      const sanitizedStock = parseInt(stock, 10) || 0;

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price_pkr: sanitizedPrice,
        stock_available: sanitizedStock,
        unit: unit,
        unit_quantity: unitQuantity || '1',
        category: category,
        image_url: downloadURL,
        shopkeeper_id: user.uid,
        in_stock: true,
        created_at: new Date().toISOString(), 
      };

      console.log('Attempting to save to Firestore:', productData);


      const newDocRef = firebaseDb.collection('products').doc();
      const firestorePromise = newDocRef.set(productData);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore took too long to respond (Timeout)!')), 10000);
      });

      await Promise.race([firestorePromise, timeoutPromise]);

      Alert.alert('Success', 'Product added successfully!');


      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setUnit('Kg');
      setUnitQuantity('1');
      setCategory('Vegetables');
      setImageUri(null);
      setImageBase64(null);

      navigation.navigate('Dashboard');
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert('Caught Error', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, description, setDescription, price, setPrice, stock, setStock, unit, setUnit, unitQuantity, setUnitQuantity, category, setCategory, imageUri, handleImagePick, loading, handleSaveProduct };
};
