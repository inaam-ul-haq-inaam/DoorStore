import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Product } from '../customer/screens/HomeScreen/controller';

interface Props {
  item: Product;
  onAdd: (product: Product, pos: {x: number, y: number}) => void;
  onPress: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ item, onAdd, onPress }) => {
  const imageRef = useRef<View>(null);

  const handleAdd = () => {
    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      onAdd(item, { x: pageX, y: pageY });
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={() => onPress(item)}
    >
      <View ref={imageRef}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit>
          Rs. {item.price} <Text style={styles.weight}>/ {item.weight}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.7}
        onPress={handleAdd}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 12,
    flex: 1, // Ensures cards take equal width in 2 columns
    alignItems: 'center',

    // Premium Soft Shadow (iOS)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    // Premium Soft Shadow (Android)
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 40, // Keeps card heights consistent even if title is 1 line
  },
  weight: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  price: {
    color: colors.textMain,
    fontSize: 18,
    fontWeight: '900', // Extra bold for price to make it pop
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primaryLight,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
