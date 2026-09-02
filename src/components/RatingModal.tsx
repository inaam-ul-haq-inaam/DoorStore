import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

interface RatingModalProps {
  visible: boolean;
  orderId?: string;
  rating: number;
  setRating: (rating: number) => void;
  reviewText: string;
  setReviewText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  cancelLabel?: string;
  loading?: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  orderId,
  rating,
  setRating,
  reviewText,
  setReviewText,
  onSubmit,
  onCancel,
  cancelLabel = 'Cancel',
  loading = false,
}) => (
  <Modal visible={visible} transparent={true} animationType="slide">
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.headerBox}>
          <Icon name="star" size={50} color="#FBBF24" />
        </View>
        <Text style={styles.title}>Rate Your Last Order</Text>
        <Text style={styles.subtitle}>
          How was your experience with order #{orderId?.slice(0, 8).toUpperCase() || ''}?
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FBBF24' : '#D1D5DB'}
                style={{ marginHorizontal: 4 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.reviewInput}
          placeholder="Any feedback? (Optional)"
          placeholderTextColor={colors.textMuted}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
        />

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} disabled={loading}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
          {loading ? (
            <View style={[styles.loadingBtn]}>
              <ActivityIndicator color="#FFF" />
            </View>
          ) : (
            <PrimaryButton
              title="Submit"
              onPress={onSubmit}
              style={{ flex: 1, paddingVertical: 14, opacity: rating > 0 ? 1 : 0.5 }}
              disabled={rating === 0}
            />
          )}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  headerBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: colors.textMain,
    width: '100%',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingBtn: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
