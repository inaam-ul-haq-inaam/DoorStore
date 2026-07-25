import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';

export interface ChatPreview {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadByAdmin: boolean;
}

export const useInboxController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseDb
      .collection('chats')
      .orderBy('lastMessageAt', 'desc')
      .onSnapshot(snapshot => {
        const fetched: ChatPreview[] = snapshot.docs.map(doc => ({
          customerId: doc.id,
          ...(doc.data() as Omit<ChatPreview, 'customerId'>),
        }));
        setChats(fetched);
        setLoading(false);
      }, error => {
        console.error('Inbox error:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const openChat = (customerId: string, customerName: string) => {
    navigation.navigate('AdminChat', { customerId, customerName });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return { chats, loading, openChat, handleGoBack };
};
