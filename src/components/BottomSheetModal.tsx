import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode; // Modal ke andar jo bhi custom UI dikhani ho
}

export const BottomSheetModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Dark Transparent Backdrop */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          {/* Main Modal Content (Bottom Sheet) */}
          <View style={styles.bottomSheet}>
            {/* Top Drag Indicator (Pill) */}
            <View style={styles.dragIndicator} />

            {/* Optional Header */}
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dynamic Content */}
            <View style={styles.content}>{children}</View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark transparent background
    justifyContent: 'flex-end', // Modal ko bottom par lane ke liye
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radiusLarge,
    borderTopRightRadius: spacing.radiusLarge,
    paddingHorizontal: spacing.l,
    paddingBottom: 40, // Safe area space for bottom screen
    paddingTop: spacing.s,
    maxHeight: '80%', // Screen se zyada bara na ho

    // Shadow for premium pop feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  content: {
    // Yahan child components aayenge
  },
});
