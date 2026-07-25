import { useState, useEffect } from 'react';
import { firebaseDb } from '../services/firebase';

export const useStoreStatus = (initialState: boolean = true) => {
  const [isStoreOpen, setIsStoreOpen] = useState(initialState);

  useEffect(() => {
    const unsubscribe = firebaseDb
      .collection('settings')
      .doc('store_status')
      .onSnapshot((doc) => {
        if (doc.exists()) {
          setIsStoreOpen(doc.data()?.is_open ?? true);
        }
      });

    return () => unsubscribe();
  }, []);

  return { isStoreOpen, setIsStoreOpen };
};
