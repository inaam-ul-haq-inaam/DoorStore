import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useOrderDetailsController } from './controller';
import { ScreenLoader } from '../../../components/ScreenLoader';

export const OrderDetailsScreen = () => {
  const { orderDetails, loading, isUpdating, handleAction, handleGoBack } = useOrderDetailsController();

  if (loading) {
    return <ScreenLoader />;
  }

  if (!orderDetails) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Order not found.</Text>
        <TouchableOpacity onPress={handleGoBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primaryDark, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Order #{orderDetails.id.slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.value}>{orderDetails.customer_name}</Text>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{orderDetails.customer_phone}</Text>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{orderDetails.delivery_address}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <View>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>Rs. {orderDetails.delivery_fee || 0}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Calculated Distance:</Text>
            <Text style={styles.value}>{orderDetails.distance_km ? `${orderDetails.distance_km.toFixed(2)} KM` : 'N/A'}</Text>
          </View>
        </View>

        <Text style={styles.label}>Current Status:</Text>
        <Text style={[styles.value, { color: colors.primaryDark }]}>{orderDetails.status.toUpperCase()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Ordered Items</Text>
      {orderDetails.items && orderDetails.items.map((item: any, index: number) => (
        <View key={index} style={styles.itemRow}>
          <Text style={{ flex: 1 }}>
            {item.quantity}x {item.name}
          </Text>
          <Text style={{ fontWeight: 'bold' }}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total: Rs. {orderDetails.total_amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.actionRow}>
        {orderDetails.status === 'incoming' && (
          <PrimaryButton
            title="Accept Order"
            onPress={() => handleAction('pending')}
            isLoading={isUpdating}
          />
        )}
        {orderDetails.status === 'pending' && (
          <PrimaryButton
            title="Mark as Completed"
            onPress={() => handleAction('completed')}
            isLoading={isUpdating}
          />
        )}
        {orderDetails.status === 'completed' && (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>Order Completed ✅</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.l,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  backButton: {
    paddingRight: spacing.m,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
  value: { fontSize: 16, fontWeight: '600', marginBottom: 2, color: colors.textMain },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.s,
    color: colors.primaryDark,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalContainer: { paddingVertical: spacing.l, alignItems: 'flex-end' },
  totalText: { fontSize: 22, fontWeight: '900', color: colors.primaryDark },
  actionRow: { marginTop: 10, marginBottom: 50 },
  completedBox: {
    backgroundColor: '#EBF4F0',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  completedText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
