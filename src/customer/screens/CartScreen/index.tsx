import React from 'react';
import { View, Text, FlatList, Image, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCartController } from './controller';
import { styles } from './styles';
import { IconButton } from '../../../components/IconButton';
import { QuantityStepper } from '../../../components/QuantityStepper';
import { colors } from '../../../theme/colors';

export const CartScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    subTotal,
    dynamicDeliveryFee,
    grandTotal,
    calculatingFee,
    deliveryFeePending,
    distance,
    shopAddress,
    handleIncrease,
    handleDecrease,
    handleCheckout,
    handleGoBack,
  } = useCartController();

  const isEmpty = cartItems.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <IconButton icon="‹" onPress={handleGoBack} />
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your cart is empty!</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any groceries to your cart yet.
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={handleGoBack}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>

          <FlatList
            data={cartItems}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartItemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemPrice} numberOfLines={1} adjustsFontSizeToFit>
                    Rs. {item.price.toFixed(2)} <Text style={styles.itemWeight}>/ {item.weight}</Text>
                  </Text>
                </View>
                <QuantityStepper
                  quantity={item.quantity}
                  onIncrease={() => handleIncrease(item.id)}
                  onDecrease={() => handleDecrease(item.id)}
                />
              </View>
            )}
            ListFooterComponent={
              <View style={styles.receiptCard}>
                <Text style={styles.receiptTitle}>Bill Summary</Text>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Subtotal</Text>
                  <Text style={styles.receiptValue}>Rs. {subTotal.toFixed(2)}</Text>
                </View>

                {shopAddress ? (
                  <View style={{ marginBottom: 12, backgroundColor: '#F0F9F4', padding: 12, borderRadius: 8 }}>
                    <Text style={{ fontSize: 13, color: colors.textMain, fontWeight: 'bold' }}>Shop Location:</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>{shopAddress}</Text>
                    <Text style={{ fontSize: 13, color: colors.primaryDark, marginTop: 4, fontWeight: '600' }}>
                      Distance from you: {distance.toFixed(2)} KM
                    </Text>
                  </View>
                ) : null}

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Delivery Fee</Text>
                  {calculatingFee ? (
                    <ActivityIndicator size="small" color={colors.primaryDark} />
                  ) : deliveryFeePending ? (
                    <Text style={styles.receiptValue}>Shop will confirm</Text>
                  ) : (
                    <Text style={styles.receiptValue}>Rs. {dynamicDeliveryFee.toFixed(2)}</Text>
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  {calculatingFee ? (
                     <ActivityIndicator size="small" color={colors.primaryDark} />
                  ) : (
                    <Text style={styles.totalValue}>Rs. {grandTotal.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            }
          />

          <View style={[styles.stickyBottomBar, { paddingBottom: tabBarHeight + insets.bottom + 15 }]}>
            <View style={styles.checkoutRow}>
              <View>
                <Text style={styles.bottomTotalLabel}>Total Pay</Text>
                {calculatingFee ? (
                   <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.bottomTotalValue}>Rs. {grandTotal.toFixed(2)}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} disabled={calculatingFee}>
                <Text style={styles.checkoutBtnText}>Checkout</Text>
                <Icon name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};
