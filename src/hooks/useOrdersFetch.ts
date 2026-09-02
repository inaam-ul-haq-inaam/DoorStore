import { useState, useEffect } from 'react';
import { firebaseDb } from '../services/firebase';

export interface UseOrdersFetchOptions {
  filters: {
    field: string;
    operator: any;
    value: any;
  }[];
}

export const useOrdersFetch = <T extends { id: string; created_at: string }>(
  options: UseOrdersFetchOptions
) => {
  const [orders, setOrders] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (options.filters.some(f => f.value === undefined || f.value === null || f.value === '')) {
      setLoading(false);
      return;
    }

    let query: any = firebaseDb.collection('orders');

    options.filters.forEach(f => {
      query = query.where(f.field, f.operator, f.value);
    });

    const unsubscribe = query.onSnapshot(
      (snapshot: any) => {
        const fetchedOrders: T[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        fetchedOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error: any) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [JSON.stringify(options.filters)]); 

  return { orders, loading };
};
