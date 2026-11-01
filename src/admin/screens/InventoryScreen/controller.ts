import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import { CATEGORY_OPTIONS } from '../EditProductScreen/controller';

// Search/filter pill list — "All" ke saath wahi categories jo product
// add/edit me use hoti hain (ek hi source of truth, drift nahi hoga).
export const CATEGORY_FILTER_OPTIONS = ['All', ...CATEGORY_OPTIONS];

export interface InventoryItem {
  id: string;
  name: string;
  price_pkr: number;
  stock_available: number;
  image_url: string;
  in_stock: boolean;
  unit: string;
  unit_quantity: string;
  category: string;
}

export const useInventoryController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Admin poora inventory dekhta hai — chahe product kisne bhi add kiya
    // ho ya usme shopkeeper_id field hi missing ho (purane data).
    // Shopkeeper sirf apne hi products manage karta hai.
    const productsQuery = userProfile?.role === 'admin'
      ? firebaseDb.collection('products')
      : firebaseDb.collection('products').where('shopkeeper_id', '==', user.uid);

    const unsubscribe = productsQuery
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
              in_stock: data.in_stock !== false && (data as any).inStock !== false, 
              unit: data.unit || 'Unit',
              unit_quantity: data.unit_quantity || '1',
              category: data.category || 'Vegetables',
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
  }, [userProfile?.role]);

  /**
   * Search + category filter — sirf UI-level filtering. Product ID same
   * rehta hai, isliye toggleStock/increment/etc. Firestore par waise hi
   * kaam karte hain chahe list filtered ho ya na ho.
   */
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter(product => {
      const matchesSearch = query === '' || product.name.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

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
      const nextValue = !currentValue;
      await firebaseDb.collection('products').doc(id).update({
        in_stock: nextValue,
        inStock: nextValue,
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
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleIncrement,
    handleDecrement,
    toggleStock,
    handleDelete,
    navigation
  };
};
