import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Linking,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

interface WhatsAppFloatButtonProps {
  phoneNumber: string;
  message?: string;
}

const BUTTON_SIZE = 60;
const MARGIN = 12;
// Reserve space for the floating tab bar (bottom: 20, height: 65)
// so the button never slides behind it.
const TAB_RESERVE = 100;

export const WhatsAppFloatButton: React.FC<WhatsAppFloatButtonProps> = ({
  phoneNumber,
  message = 'Hello DoorStore! I would like to place an order.',
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isDragging = useRef(false);
  const lastTap = useRef(0);

  const openWhatsApp = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => {
        return Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, g) => {
        isDragging.current = true;
        pan.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();

        if (!isDragging.current) {
          const now = Date.now();
          if (now - lastTap.current > 300) {
            lastTap.current = now;
            openWhatsApp();
          }
          return;
        }

        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        // Snap to nearest horizontal edge
        const snapX = currentX + BUTTON_SIZE / 2 < screenWidth / 2
          ? MARGIN
          : screenWidth - BUTTON_SIZE - MARGIN;

        // Keep the button above the tab bar and inside the screen
        const topLimit = MARGIN;
        const bottomLimit = screenHeight - TAB_RESERVE - insets.bottom - BUTTON_SIZE - MARGIN;
        const clampedY = Math.max(topLimit, Math.min(bottomLimit, currentY));

        Animated.spring(pan, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: false,
          bounciness: 8,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: TAB_RESERVE + 10 + insets.bottom },
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.button}>
        <Icon name="logo-whatsapp" size={32} color="#FFF" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
    elevation: 15,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});