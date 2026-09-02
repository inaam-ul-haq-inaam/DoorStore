import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';

export interface ReviewOrder {
  id: string;
  customer_name: string;
  created_at: string;
  rating: number;
  review_text?: string;
}

export const useAdminReviewsController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const [reviews, setReviews] = useState<ReviewOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseDb.collection('orders')
      .where('is_rated', '==', true)
      .onSnapshot(snapshot => {
        const fetched: ReviewOrder[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            customer_name: data.customer_name || 'Unknown Customer',
            created_at: data.created_at || new Date().toISOString(),
            rating: data.rating || 0,
            review_text: data.review_text || '',
          });
        });

        fetched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setReviews(fetched);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return { reviews, loading, handleGoBack };
};
