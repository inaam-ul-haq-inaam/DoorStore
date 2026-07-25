import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { useCart } from '../../../context/CartContext';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStoreStatus } from '../../../hooks/useStoreStatus';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  image: string;
  stock_available?: number;
  unit?: string;
  description?: string;
  category?: string;
  rating?: number;
  rating_count?: number;
}

export const useHomeController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isStoreOpen } = useStoreStatus(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Category State — using high-quality, full-color photo URLs
  const categories = [
    { id: 'cat_1', name: 'All', imageUrl: 'https://images.unsplash.com/photo-1543168256-418811576931?w=200&q=80&auto=format&fit=crop' },
    { id: 'cat_2', name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&q=80&auto=format&fit=crop' },
    { id: 'cat_3', name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80&auto=format&fit=crop' },
    { id: 'cat_4', name: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80&auto=format&fit=crop' },
  ];
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Location States
  const [userLocation, setUserLocation] = useState('Islamabad, Pakistan');
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  // Rating State
  const [unratedOrder, setUnratedOrder] = useState<any>(null);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [shopRating, setShopRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Shop Contact
  const [shopPhoneNumber, setShopPhoneNumber] = useState<string | null>('03025769675');

  // GPS Location
  const [fetchingGpsLocation, setFetchingGpsLocation] = useState(false);

  useEffect(() => {
    // Load existing location from storage
    const loadLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('@customer_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.address) {
            setUserLocation(profile.address);
          }
        }
      } catch (e) {
        console.log('Error loading location', e);
      }
    };
    loadLocation();

    // Fetch shop phone from Firestore
    firebaseDb.collection('shop_info').doc('contact').get().then(doc => {
      if (doc.exists()) {
        const data = doc.data();
        if (data?.phone) setShopPhoneNumber(data.phone);
      }
    }).catch(() => {});

    const unsubscribeProducts = firebaseDb
      .collection('products')
      .where('stock_available', '>', 0)
      .onSnapshot(
        snapshot => {
          const fetchedProducts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unknown',
              weight: data.unit ? `${data.unit_quantity || '1'} ${data.unit}` : '1 Unit', 
              price: data.price_pkr || 0,
              image: data.image_url || '',
              stock_available: data.stock_available || 0,
              unit: data.unit || 'Unit',
              description: data.description || '',
              category: data.category || 'Vegetables',
              rating: typeof data.rating === 'number' ? data.rating : 0,
              rating_count: typeof data.rating_count === 'number' ? data.rating_count : 0,
              in_stock: data.in_stock !== false,
            };
          }).filter(product => product.in_stock);
          setProducts(fetchedProducts);
          setLoading(false);
        },
        error => {
          console.error("Error fetching products: ", error);
          setLoading(false);
        }
      );

    let unsubscribeOrders = () => {};
    const user = firebaseAuth.currentUser;
    if (user) {
      unsubscribeOrders = firebaseDb.collection('orders')
        .where('customer_id', '==', user.uid)
        .where('status', '==', 'completed')
        .where('is_rated', '==', false)
        .limit(1)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            if (!data.prompt_skipped) {
              setUnratedOrder({ id: doc.id, ...data });
              setRatingModalVisible(true);
            }
          }
        });
    }

    let unsubscribeAllOrders = () => {};
    unsubscribeAllOrders = firebaseDb.collection('orders')
      .where('is_rated', '==', true)
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          let total = 0;
          let count = 0;
          snapshot.forEach(doc => {
            const r = doc.data().rating;
            if (typeof r === 'number') {
              total += r;
              count++;
            }
          });
          if (count > 0) {
            setShopRating(Number((total / count).toFixed(1)));
          } else {
            setShopRating(null);
          }
        } else {
          setShopRating(null);
        }
      });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeAllOrders();
    };
  }, []);

  const handleSaveLocation = async () => {
    if (tempLocation.trim()) {
      setUserLocation(tempLocation.trim());
      // Save it back to storage so Checkout screen pre-fills it
      try {
        const stored = await AsyncStorage.getItem('@customer_profile');
        const profile = stored ? JSON.parse(stored) : {};
        profile.address = tempLocation.trim();
        await AsyncStorage.setItem('@customer_profile', JSON.stringify(profile));
      } catch (e) {
        console.log('Error saving location', e);
      }
    }
    setLocationModalVisible(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategoryId);

  // GPS Location Handler
  const handleUseGpsLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }
      }
      setFetchingGpsLocation(true);
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'DoorStoreApp/1.0' } }
            );
            const data = await res.json();
            const address = data?.display_name
              ? data.display_name.split(',').slice(0, 3).join(', ')
              : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setTempLocation(address);
          } catch {
            setTempLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setFetchingGpsLocation(false);
          }
        },
        (error) => {
          setFetchingGpsLocation(false);
          Alert.alert('Error', 'Could not get location. Please enter manually.');
          console.log('GPS error:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (e) {
      setFetchingGpsLocation(false);
      Alert.alert('Error', 'Location permission failed.');
    }
  };

  const handleSubmitRating = async () => {
    if (!unratedOrder || rating === 0) return;
    if (ratingLoading) return; // prevent double submit
    setRatingLoading(true);
    try {
      await firebaseDb.collection('orders').doc(unratedOrder.id).update({
        is_rated: true,
        rating: rating,
        review_text: reviewText,
      });

      // Propagate rating to each product in the order
      if (unratedOrder.items && Array.isArray(unratedOrder.items)) {
        for (const item of unratedOrder.items) {
          if (item.id) {
            try {
              const prodRef = firebaseDb.collection('products').doc(item.id);
              const prodDoc = await prodRef.get();
              if (prodDoc.exists()) {
                const prodData = prodDoc.data();
                const currentCount = typeof prodData?.rating_count === 'number' ? prodData.rating_count : 0;
                const currentRating = typeof prodData?.rating === 'number' ? prodData.rating : 0;
                
                const newCount = currentCount + 1;
                const newTotal = (currentRating * currentCount) + rating;
                const newAvg = Number((newTotal / newCount).toFixed(1));
                
                await prodRef.update({
                  rating: newAvg,
                  rating_count: newCount
                });
              }
            } catch(e) {
              console.log('Failed to propagate rating to product', item.id, e);
            }
          }
        }
      }

      setRatingModalVisible(false);
      setUnratedOrder(null);
      setRating(0);
      setReviewText('');
      Alert.alert('Thank You! 🌟', 'Your rating has been submitted successfully.');
    } catch (error) {
      console.log('Error saving rating', error);
      Alert.alert('Error', 'Could not submit rating. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSkipRating = async () => {
    if (!unratedOrder) return;
    setRatingModalVisible(false);
    // Optional: we don't update is_rated to true here if we want them to rate from Orders screen later.
    // But since onSnapshot will trigger again, let's just mark it as dismissed locally by setting the unratedOrder to null
    // Actually, onSnapshot will fire again if they return to this screen.
    // So let's mark it as skipped in Firestore so it doesn't bother them again on the Home Screen.
    // But we still want them to be able to rate from Orders Screen.
    // Actually, `is_rated: 'skipped'` would be better. Let's just set `prompt_skipped: true` in Firestore.
    try {
      await firebaseDb.collection('orders').doc(unratedOrder.id).update({
        prompt_skipped: true
      });
    } catch(e){}
  };

  const filteredProducts = products
    .filter(p => activeCategory?.name === 'All' || p.category === activeCategory?.name)
    .filter(p => searchQuery.trim() === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return {
    categories,
    products: filteredProducts,
    loading,
    isStoreOpen,
    selectedProduct,
    userLocation,
    isLocationModalVisible,
    tempLocation,
    setTempLocation,
    setLocationModalVisible,
    handleSaveLocation,
    handleAddToCart,
    openProductDetails,
    closeProductDetails,
    handleLogout,
    selectedCategoryId,
    setSelectedCategoryId,
    activeCategory,
    searchQuery,
    setSearchQuery,
    unratedOrder,
    isRatingModalVisible,
    setRatingModalVisible,
    rating,
    setRating,
    reviewText,
    setReviewText,
    handleSubmitRating,
    handleSkipRating,
    shopRating,
    ratingLoading,
    shopPhoneNumber,
    fetchingGpsLocation,
    handleUseGpsLocation,
  };
};
