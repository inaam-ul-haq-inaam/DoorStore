import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { firebaseDb } from '../services/firebase';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface UseChatOptions {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  onOpenPayload?: Record<string, any>;
  onSendParentPayload?: Record<string, any>;
}

export const useChat = ({
  chatId,
  currentUserId,
  currentUserName,
  isAdmin,
  onOpenPayload,
  onSendParentPayload,
}: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseDb
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        (snapshot) => {
          const fetched: Message[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Message, 'id'>),
          }));
          setMessages(fetched);
          setLoading(false);

          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        },
        (error) => {
          console.error('Chat listen error:', error);
          setLoading(false);
        }
      );

    if (onOpenPayload) {
      firebaseDb.collection('chats').doc(chatId).set(onOpenPayload, { merge: true });
    }

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !chatId) return;

    setInputText('');

    try {
      const messageData = {
        text,
        senderId: currentUserId,
        senderName: currentUserName,
        createdAt: new Date().toISOString(),
        isAdmin,
      };

      await firebaseDb
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageData);

      if (onSendParentPayload) {

        const payload = {
          ...onSendParentPayload,
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
        };
        await firebaseDb.collection('chats').doc(chatId).set(payload, { merge: true });
      } else {
        await firebaseDb.collection('chats').doc(chatId).set(
          { lastMessage: text, lastMessageAt: new Date().toISOString() },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  return {
    messages,
    loading,
    inputText,
    setInputText,
    handleSend,
    flatListRef,
  };
};
