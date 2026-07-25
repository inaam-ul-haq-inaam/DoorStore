import React from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { useProductDetailsController } from './controller';
import { styles } from './styles';

// Components import karein
import { IconButton } from '../../../components/IconButton';
import { CartBadgeIcon } from '../../../components/CartBadgeIcon';
import { QuantityStepper } from '../../../components/QuantityStepper';
import { PrimaryButton } from '../../../components/PrimaryButton';

export const ProductDetailsScreen = () => {
  const { 
    product, 
    quantity, 
    handleIncrease, 
    handleDecrease, 
    handleAddToCart,
    handleGoBack,
    handleGoToCart
  } = useProductDetailsController();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#024036" />

      {/* Background Curved Green Header */}
      <View style={styles.headerBackground} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <IconButton icon="‹" onPress={handleGoBack} />
        <Text style={styles.headerTitle}>Product Details</Text>
        <CartBadgeIcon
          itemCount={2}
          onPress={handleGoToCart}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        {/* Product Information */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.name}</Text>
            <IconButton
              icon="♡"
              onPress={() => console.log('Added to Favorites')}
            />
          </View>

          <Text style={styles.weight}>{product.weight}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}$</Text>
            <Text style={styles.fastDeliveryText}>
              ⚡ Available on fast delivery
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>★ {product.rating} Rating</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.stepperContainer}>
          <QuantityStepper
            quantity={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
          />
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Add to cart"
            icon="🛒"
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </View>
  );
};
