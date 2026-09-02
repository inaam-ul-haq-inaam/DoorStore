import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
}

const AVATAR_COLORS = ['#024036', '#2563EB', '#7C3AED', '#DB2777', '#EA580C'];

const SIZE_MAP = {
  small: { container: 32, fontSize: 14 },
  medium: { container: 52, fontSize: 18 },
  large: { container: 90, fontSize: 32 },
};

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'medium', backgroundColor }) => {
  const sizeConfig = SIZE_MAP[size];
  const borderRadius = sizeConfig.container / 2;

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const autoBg = backgroundColor || AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius,
          borderWidth: size === 'large' ? 3 : 2,
          borderColor: 'rgba(255,255,255,0.3)',
        }}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius,
          backgroundColor: autoBg,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        size === 'large' && {
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,0.3)',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
      ]}
    >
      <Text style={{ color: '#FFF', fontSize: sizeConfig.fontSize, fontWeight: 'bold' }}>
        {initials}
      </Text>
    </View>
  );
};
