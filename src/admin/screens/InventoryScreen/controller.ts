import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { AdminDrawerNavigationProp } from '../../../navigation/types';

export interface InventoryItem {
  id: string;
  name: string;
  price_pkr: number;
  stock_available: number;
  image_url: string;
  in_stock: boolean;
  unit: string;
  unit_quantity: string;
}

export const useInventoryController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseDb
      .collection('products')
      .where('shopkeeper_id', '==', user.uid)
      .onSnapshot(
        snapshot => {
          const fetchedProducts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unknown',
              price_pkr: data.price_pkr || 0,
              stock_available: data.stock_available || 0,
              image_url: data.image_url || '',
              in_stock: data.in_stock !== false, 
              unit: data.unit || 'Unit',
              unit_quantity: data.unit_quantity || '1',
            };
          });
          setProducts(fetchedProducts);
          setLoading(false);
        },
        error => {
          console.error("Error fetching inventory: ", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleIncrement = async (id: string) => {
    try {
      await firebaseDb.collection('products').doc(id).update({
        stock_available: firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error("Error incrementing stock:", error);
    }
  };

  const handleDecrement = async (id: string) => {
    try {
      await firebaseDb.collection('products').doc(id).update({
        stock_available: firestore.FieldValue.increment(-1)
      });
    } catch (error) {
      console.error("Error decrementing stock:", error);
    }
  };

  const toggleStock = async (id: string, currentValue: boolean) => {
    try {
      await firebaseDb.collection('products').doc(id).update({
        in_stock: !currentValue
      });
    } catch (error) {
      console.error("Error toggling stock:", error);
      Alert.alert("Error", "Failed to update stock status.");
    }
  };

  const handleDelete = (id: string, image_url: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await firebaseDb.collection('products').doc(id).delete();
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product.");
            }
          }
        }
      ]
    );
  };

  return {
    products,
    loading,
    handleIncrement,
    handleDecrement,
    toggleStock,
    handleDelete,
    navigation
  };
};
