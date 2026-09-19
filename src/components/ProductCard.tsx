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
    borderRadius: 10,
    padding: 6,
    marginHorizontal: 3,
    marginVertical: 3,
    flex: 1,
    maxWidth: '33.3333%',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },
  image: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: colors.textMain,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 24,
  },
  weight: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  price: {
    color: colors.textMain,
    fontSize: 12.5,
    fontWeight: '900',
    marginTop: 3,
  },
  addButton: {
    backgroundColor: colors.primaryLight,
    width: '100%',
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
