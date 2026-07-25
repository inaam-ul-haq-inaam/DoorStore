import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useInboxController, ChatPreview } from './controller';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Avatar } from '../../../components/Avatar';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';

export const InboxScreen = () => {
  const { chats, loading, openChat, handleGoBack } = useInboxController();

  const renderItem = ({ item }: { item: ChatPreview }) => {
    const initials = item.customerName
      ? item.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';
    const timeStr = item.lastMessageAt
      ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => openChat(item.customerId, item.customerName)}
        activeOpacity={0.7}
      >
        <View style={{ marginRight: 14 }}>
          <Avatar name={item.customerName || '?'} size="medium" />
        </View>
        <View style={styles.info}>
          <View style={styles.infoTopRow}>
            <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
          <View style={styles.infoBottomRow}>
            <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            {item.unreadByAdmin && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Icon name="chatbubbles-outline" size={24} color={colors.surface} />
      </View>

      {loading ? (
        <ScreenLoader />
      ) : chats.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No Messages Yet"
          subtitle="Customer messages will appear here."
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.customerId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 52,
    elevation: 4,
  },
  headerTitle: { color: colors.surface, fontSize: 22, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textMain, marginTop: 16 },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  list: { paddingVertical: 8 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  /* Avatar - REMOVED (now in Avatar component) */
  info: { flex: 1 },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customerName: { fontSize: 16, fontWeight: 'bold', color: colors.textMain, flex: 1 },
  time: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
  lastMsg: { fontSize: 14, color: colors.textMuted, flex: 1 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 82 },
});
