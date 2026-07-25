import { useState, useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { CustomerStackParamList, CustomerStackNavigationProp } from '../../../navigation/types';

// Filhal dummy data type, baad mein navigation parameters se aayega
export interface ProductDetail {
  id: string;
  name: string;
  weight: string;
  price: number;
  image: string;
  description: string;
  rating: number;
}

export const useProductDetailsController = () => {
  const route = useRoute<RouteProp<CustomerStackParamList, 'ProductDetails'>>();
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const { productId } = route.params;

  // Dummy product based on reference image
  const [product] = useState<ProductDetail>({
    id: productId || '1',
    name: 'Beef Mixed Cut Bone In 50 gm',
    weight: '1000 gm',
    price: 23.46,
    image: 'https://cdn-icons-png.flaticon.com/512/3143/3143645.png', // Transparent dummy image
    description:
      '100% satisfaction guarantee. If you experience any of the following issues, missing, poor item, late arrival, unprofessional service... Read more',
    rating: 4.5,
  });

  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    console.log(`Added ${quantity}x ${product.name} to cart!`);
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleGoToCart = () => {
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  return {
    product,
    quantity,
    handleIncrease,
    handleDecrease,
    handleAddToCart,
    handleGoBack,
    handleGoToCart,
  };
};
