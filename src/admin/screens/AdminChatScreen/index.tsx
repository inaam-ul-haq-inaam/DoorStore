import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAdminChatController, Message } from './controller';
import { colors } from '../../../theme/colors';
import { Avatar } from '../../../components/Avatar';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';

export const AdminChatScreen = () => {
  const {
    messages,
    loading,
    inputText,
    setInputText,
    handleSend,
    handleGoBack,
    customerName,
    flatListRef,
  } = useAdminChatController();

  const renderMessage = ({ item }: { item: Message }) => {
    const isAdmin = item.isAdmin;
    return (
      <View style={[styles.msgRow, isAdmin ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isAdmin && (
          <View style={{ marginRight: 8 }}>
            <Avatar name={customerName || 'C'} size="small" backgroundColor="#64748B" />
          </View>
        )}
        <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleCustomer]}>
          <Text style={[styles.bubbleText, isAdmin && styles.bubbleTextAdmin]}>{item.text}</Text>
          <Text style={[styles.timeText, isAdmin && styles.timeTextAdmin]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={colors.surface} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={{ marginRight: 10 }}>
            <Avatar name={customerName || 'C'} size="small" backgroundColor="rgba(255,255,255,0.25)" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{customerName}</Text>
            <Text style={styles.headerSub}>Customer</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <ScreenLoader />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <EmptyState
                icon="chatbubble-ellipses-outline"
                title="No messages yet."
                iconSize={60}
              />
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Reply to customer..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  /* Avatar styles - REMOVED (now in Avatar component) */
  headerTitle: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  bubbleAdmin: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  bubbleCustomer: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, color: colors.textMain, lineHeight: 21 },
  bubbleTextAdmin: { color: colors.surface },
  timeText: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  timeTextAdmin: { color: 'rgba(255,255,255,0.65)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textMain,
    maxHeight: 120,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
