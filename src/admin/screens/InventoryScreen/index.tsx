import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useInventoryController, InventoryItem } from './controller';
import { ScreenLoader } from '../../../components/ScreenLoader';

export const InventoryScreen = () => {
  const { products, loading, handleIncrement, handleDecrement, toggleStock, handleDelete, navigation } = useInventoryController();

  if (loading) {
    return <ScreenLoader />;
  }

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={[styles.card, !item.in_stock && styles.cardOutOfStock]}>
      <View>
        <Image source={{ uri: item.image_url }} style={[styles.image, !item.in_stock && styles.imageOutOfStock]} />
        {!item.in_stock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Switch
            value={item.in_stock}
            onValueChange={() => toggleStock(item.id, item.in_stock)}
            trackColor={{ false: '#D1D5DB', true: '#34D399' }}
            thumbColor={item.in_stock ? '#059669' : '#9CA3AF'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
        <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit>
          Rs. {item.price_pkr} <Text style={{ color: colors.textMuted, fontSize: 12 }}>/ {item.unit_quantity} {item.unit}</Text>
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
          >
            <Icon name="create-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.stockControl}>
            <TouchableOpacity 
              style={styles.stockBtn} 
              onPress={() => handleDecrement(item.id)}
              disabled={item.stock_available <= 0}
            >
              <Text style={styles.stockBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.stockCount}>{item.stock_available}</Text>

            <TouchableOpacity style={styles.stockBtn} onPress={() => handleIncrement(item.id)}>
              <Text style={styles.stockBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.image_url)}>
            <Icon name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="cube-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyText}>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.m,
  },
  emptyText: {
    marginTop: spacing.m,
    fontSize: 16,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    marginBottom: spacing.m,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: spacing.radiusSmall,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.m,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMain,
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stockControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stockBtnText: {
    fontSize: 18,
    color: colors.textMain,
    fontWeight: '600',
    lineHeight: 20,
  },
  stockCount: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  editBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  cardOutOfStock: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 30,
    left: -5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    transform: [{ rotate: '-10deg' }],
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
