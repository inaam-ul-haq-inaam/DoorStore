import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { firebaseAuth } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useChat, Message } from '../../../hooks/useChat';

export type { Message };

export const useCustomerChatController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const { userProfile } = useAuth();
  const user = firebaseAuth.currentUser;

  const chatId = user?.uid || '';
  const currentUserName = userProfile?.full_name || 'Customer';

  const {
    messages,
    loading,
    inputText,
    setInputText,
    handleSend,
    flatListRef,
  } = useChat({
    chatId,
    currentUserId: chatId,
    currentUserName,
    isAdmin: false,
    onSendParentPayload: {
      customerId: chatId,
      customerName: currentUserName,
      unreadByAdmin: true,
    },
  });

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return {
    messages,
    loading,
    inputText,
    setInputText,
    handleSend,
    handleGoBack,
    chatId,
    currentUserId: user?.uid || '',
    flatListRef,
  };
};
