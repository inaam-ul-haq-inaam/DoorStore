import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Zoom and fade in the logo
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Slide up and fade in the text
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Give it a brief pause so the user can see it fully
        setTimeout(() => {
          onAnimationComplete();
        }, 600);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <Icon name="basket" size={150} color="rgba(255,255,255,0.05)" style={styles.bgIconLeft} />
      <Icon name="leaf" size={120} color="rgba(255,255,255,0.05)" style={styles.bgIconRight} />

      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: logoOpacity, 
            transform: [{ scale: logoScale }] 
          }
        ]}
      >
        <Image source={require('../assets/logo.png')} style={{ width: 100, height: 100, resizeMode: 'contain' }} />
      </Animated.View>
      
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
          alignItems: 'center'
        }}
      >
        <Text style={styles.appName}>Door Store</Text>
        <Text style={styles.slogan}>Your fresh food partner</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // to keep background icons inside
  },
  bgIconLeft: {
    position: 'absolute',
    left: -30,
    top: 40,
    transform: [{ rotate: '-15deg' }]
  },
  bgIconRight: {
    position: 'absolute',
    right: -20,
    bottom: 80,
    transform: [{ rotate: '20deg' }]
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.surface,
    letterSpacing: 1,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: colors.surface,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.9,
  },
});
