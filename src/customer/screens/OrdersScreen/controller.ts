import { useState } from 'react';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { useOrdersFetch } from '../../../hooks/useOrdersFetch';

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  status: 'incoming' | 'pending' | 'completed';
  total_amount: number;
  created_at: string;
  items: any[];
  is_rated?: boolean;
  rating?: number;
  review_text?: string;
}

export const useOrdersController = () => {
  const user = firebaseAuth.currentUser;

  const { orders, loading } = useOrdersFetch<Order>({
    filters: [{ field: 'customer_id', operator: '==', value: user?.uid }],
  });

  const [selectedTab, setSelectedTab] = useState<'Active' | 'Delivered'>('Active');

  const [selectedOrderToRate, setSelectedOrderToRate] = useState<Order | null>(null);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'Active') {
      return order.status === 'incoming' || order.status === 'pending';
    } else {
      return order.status === 'completed';
    }
  });

  const openRatingModal = (order: Order) => {
    setSelectedOrderToRate(order);
    setRating(0);
    setReviewText('');
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedOrderToRate(null);
  };

  const handleSubmitRating = async () => {
    if (!selectedOrderToRate || rating === 0) return;
    try {
      await firebaseDb.collection('orders').doc(selectedOrderToRate.id).update({
        is_rated: true,
        rating: rating,
        review_text: reviewText,
      });

      if (selectedOrderToRate.items && Array.isArray(selectedOrderToRate.items)) {
        for (const item of selectedOrderToRate.items) {
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

      closeRatingModal();
    } catch (error) {
      console.log('Error saving rating', error);
    }
  };

  return { 
    orders, loading, selectedTab, setSelectedTab, filteredOrders,
    selectedOrderToRate, isRatingModalVisible, rating, setRating, reviewText, setReviewText,
    openRatingModal, closeRatingModal, handleSubmitRating
  };
};
