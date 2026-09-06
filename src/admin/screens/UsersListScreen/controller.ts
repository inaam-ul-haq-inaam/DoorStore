import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';

export interface UserItem {
  id: string;
  full_name?: string;
  phone?: string;
  email?: string;
  role?: string;
  created_at?: any;
}

export const useUsersListController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseDb
      .collection('users')
      .orderBy('created_at', 'desc')
      .onSnapshot(snapshot => {
        const fetched: UserItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<UserItem, 'id'>),
        }));
        setUsers(fetched);
        setLoading(false);
      }, error => {
        console.error('Users list error:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const openUserDetails = (userId: string) => {
    navigation.navigate('UserDetails', { userId });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return { users, loading, openUserDetails, handleGoBack };
};