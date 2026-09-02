import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface WhatsAppFloatButtonProps {
  phoneNumber: string;
}

export const WhatsAppFloatButton: React.FC<WhatsAppFloatButtonProps> = ({ phoneNumber }) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isDragging = useRef(false);
  const lastTap = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        isDragging.current = true;
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        if (!isDragging.current) {
          const now = Date.now();
          if (now - lastTap.current > 300) {
            lastTap.current = now;
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Hello DoorStore!')}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent('Hello DoorStore!')}`);
            });
          }
          return;
        }

        const screenWidth = Platform.OS === 'web' ? 400 : 380;
        const buttonWidth = 60;
        const margin = 16;

        const targetX = gestureState.moveX > screenWidth / 2
          ? screenWidth - buttonWidth - margin
          : margin;

        Animated.spring(pan, {
          toValue: { x: targetX, y: 0 },
          useNativeDriver: false,
          bounciness: 10,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
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
    bottom: 30,
    right: 20,
    zIndex: 9999,
    elevation: 15,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
