import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AdminDrawerParamList, AdminDrawerNavigationProp } from '../../../navigation/types';
import { useChat, Message } from '../../../hooks/useChat';

export type { Message };

type AdminChatRouteProp = RouteProp<AdminDrawerParamList, 'AdminChat'>;

export const useAdminChatController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const route = useRoute<AdminChatRouteProp>();
  const { customerId, customerName } = route.params;

  const {
    messages,
    loading,
    inputText,
    setInputText,
    handleSend,
    flatListRef,
  } = useChat({
    chatId: customerId,
    currentUserId: 'admin',
    currentUserName: 'Shop',
    isAdmin: true,
    onOpenPayload: { unreadByAdmin: false },
    onSendParentPayload: { unreadByAdmin: false },
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
    customerName,
    flatListRef,
  };
};
