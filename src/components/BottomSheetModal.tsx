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
  children: React.ReactNode; 
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

      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>

          <View style={styles.bottomSheet}>

            <View style={styles.dragIndicator} />


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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'flex-end', 
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radiusLarge,
    borderTopRightRadius: spacing.radiusLarge,
    paddingHorizontal: spacing.l,
    paddingBottom: 40, 
    paddingTop: spacing.s,
    maxHeight: '80%', 


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

  },
});
