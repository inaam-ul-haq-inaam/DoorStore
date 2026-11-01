import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';

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

  /**
   * Customer ko admin banaye ya admin ko wapas customer banaye.
   * Firestore rules ke mutabik role change sirf admin kar sakta hai,
   * aur confirmation ke baghair koi write nahi hoti.
   */
  const handleToggleAdmin = (user: UserItem) => {
    const currentRole = user.role || 'buyer';
    if (currentRole === 'shopkeeper') return;

    const isCurrentlyAdmin = currentRole === 'admin';
    const nextRole = isCurrentlyAdmin ? 'buyer' : 'admin';
    const name = user.full_name || 'this user';

    // Apni khud ki admin access kabhi mat hataye — warna app lock ho jayegi.
    if (isCurrentlyAdmin && user.id === firebaseAuth.currentUser?.uid) {
      Alert.alert('Not Allowed', 'You cannot remove your own admin access.');
      return;
    }

    Alert.alert(
      isCurrentlyAdmin ? 'Remove Admin Access?' : 'Make this user an Admin?',
      isCurrentlyAdmin
        ? `${name} will become a regular customer and will lose access to the admin app.`
        : `${name} will get full admin access: products, orders, settings and customer roles.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isCurrentlyAdmin ? 'Remove Admin' : 'Make Admin',
          style: isCurrentlyAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await firebaseDb.collection('users').doc(user.id).update({
                role: nextRole,
                updated_at: new Date().toISOString(),
              });
              Alert.alert(
                'Done',
                isCurrentlyAdmin
                  ? `${name} is now a customer.`
                  : `${name} is now an admin. They must restart the app to see the admin panel.`,
              );
            } catch (error: any) {
              console.error('Role change error:', error);
              Alert.alert('Error', error?.message || 'Could not update this role.');
            }
          },
        },
      ],
    );
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return { users, loading, openUserDetails, handleToggleAdmin, handleGoBack };
};