import React, { useRef, useState } from 'react';
import { View, Text, FlatList, StatusBar, Image, TextInput, TouchableOpacity, Animated, Easing, Modal, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHomeController, Product } from './controller';
import { styles } from './styles';
import { ProductCard } from '../../../components/ProductCard';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { useCart } from '../../../context/CartContext';
import { Avatar } from '../../../components/Avatar';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';
import { RatingModal } from '../../../components/RatingModal';

export const HomeScreen = () => {
  const { 
    products, 
    loading, 
    isStoreOpen, 
    selectedProduct, 
    userLocation,
    isLocationModalVisible,
    tempLocation,
    setTempLocation,
    setLocationModalVisible,
    handleSaveLocation,
    handleAddToCart, 
    openProductDetails, 
    closeProductDetails, 
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    activeCategory,
    searchQuery,
    setSearchQuery,
    handleLogout,
    unratedOrder,
    isRatingModalVisible,
    rating,
    setRating,
    reviewText,
    setReviewText,
    handleSubmitRating,
    handleSkipRating,
    ratingLoading,
    shopPhoneNumber,
    fetchingGpsLocation,
    handleUseGpsLocation,
  } = useHomeController();
  const { userProfile } = useAuth();
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Animation State
  const cartIconRef = useRef<View>(null);
  const [cartPos, setCartPos] = useState({ x: 300, y: 50 });
  const [flyingItems, setFlyingItems] = useState<{ id: string, image: string, startPos: {x: number, y: number}, animatedValue: Animated.Value }[]>([]);

  const onCartLayout = () => {
    cartIconRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (pageX && pageY) setCartPos({ x: pageX, y: pageY });
    });
  };

  const handleAddToCartWithAnimation = (product: Product, startPos: {x: number, y: number}) => {
    handleAddToCart(product);
    
    // If modal is open, close it since we added to cart
    if (selectedProduct) {
      closeProductDetails();
      // Animation will still trigger from where the button was
    }

    const animatedValue = new Animated.Value(0);
    const newFlyingItem = {
      id: Date.now().toString() + Math.random(),
      image: product.image,
      startPos,
      animatedValue
    };

    setFlyingItems(prev => [...prev, newFlyingItem]);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 700,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== newFlyingItem.id));
    });
  };

  const openLocationModal = () => {
    setTempLocation(userLocation);
    setLocationModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.headerContainer}>
        {/* Top Row: Profile & Location */}
        <View style={styles.headerTopRow}>
          <View style={styles.profileSection}>
            <View style={{ marginRight: 8 }}>
              <Avatar name={userProfile?.full_name || 'Guest'} size="small" imageUrl="https://i.pravatar.cc/150?img=11" />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                {userProfile?.full_name ? `Hi, ${userProfile.full_name.split(' ')[0]}` : 'Hi, Guest'}
              </Text>
              <TouchableOpacity style={styles.locationRow} onPress={openLocationModal}>
                <Icon name="location" size={12} color={colors.primaryLight} />
                <Text style={styles.locationText} numberOfLines={1}> {userLocation}</Text>
                <Icon name="chevron-down" size={12} color={colors.primaryLight} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('CustomerChat')}>
              <Icon name="chatbubble-ellipses-outline" size={26} color={colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bellButton, { marginLeft: 12 }]}
              onPress={() => { const { Linking } = require('react-native'); Linking.openURL(`tel:${shopPhoneNumber || '03025769675'}`); }}
            >
              <Icon name="call-outline" size={26} color={colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bellButton, { marginLeft: 16 }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
            >
              <View ref={cartIconRef} onLayout={onCartLayout}>
                <Icon name="cart-outline" size={26} color={colors.surface} />
              </View>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Row: Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Icon name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search vegetables, fruits..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Category Filter Bar */}
      <View style={{ paddingVertical: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                onPress={() => setSelectedCategoryId(cat.id)}
                style={{ alignItems: 'center', marginRight: 20 }}
              >
                <View style={[
                  { 
                    width: 70, 
                    height: 70, 
                    borderRadius: 35, 
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  },
                  isSelected ? { 
                    borderWidth: 2, 
                    borderColor: '#004d40', 
                    padding: 4 // Creates the inner ring effect
                  } : { borderWidth: 0 }
                ]}>
                  {/* Inner circle if padding is used, image takes up remaining space */}
                  <View style={{ width: '100%', height: '100%', borderRadius: 35, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={{ uri: cat.imageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </View>
                </View>
                <Text style={[
                  { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
                  isSelected && { color: '#004d40', fontWeight: 'bold', textDecorationLine: 'underline' }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>
        {searchQuery.trim()
          ? `Results for "${searchQuery}"`
          : activeCategory?.name === 'All' ? 'You might need' : activeCategory?.name}
      </Text>

      {loading ? (
        <ScreenLoader />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard 
                item={item} 
                onAdd={handleAddToCartWithAnimation} 
                onPress={openProductDetails}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="No products found"
                subtitle="Try a different name or category"
              />
            }
          />
        </View>
      )}

      {/* Product Details Bottom Sheet Modal */}
      <Modal visible={!!selectedProduct} transparent={true} animationType="slide">
        <View style={modalStyles.overlay}>
          {/* Tapping outside closes the modal */}
          <TouchableOpacity style={modalStyles.backdrop} onPress={closeProductDetails} activeOpacity={1} />
          
          <View style={modalStyles.sheet}>
            <View style={modalStyles.dragIndicator} />
            <TouchableOpacity style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }} onPress={closeProductDetails}>
              <Icon name="close-circle" size={32} color="#D1D5DB" />
            </TouchableOpacity>
            
            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
                
                {/* Big Product Image */}
                <View style={modalStyles.imageContainer}>
                  <Image source={{ uri: selectedProduct.image }} style={modalStyles.image} />
                </View>

                {/* Details */}
                <View style={modalStyles.headerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.productName}>{selectedProduct.name}</Text>
                    {selectedProduct.rating && selectedProduct.rating > 0 ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="star" size={14} color="#FBBF24" />
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FBBF24', marginLeft: 4 }}>
                          {selectedProduct.rating.toFixed(1)} <Text style={{ color: colors.textMuted, fontWeight: 'normal' }}>({selectedProduct.rating_count} Reviews)</Text>
                        </Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="star-outline" size={14} color={colors.textMuted} />
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>
                          No reviews yet
                        </Text>
                      </View>
                    )}
                    <Text style={modalStyles.productWeight}>{selectedProduct.weight}</Text>
                  </View>
                  <Text style={modalStyles.productPrice}>Rs. {selectedProduct.price}</Text>
                </View>

                {/* Optional Description */}
                {selectedProduct.description ? (
                  <View style={modalStyles.descContainer}>
                    <Text style={modalStyles.descTitle}>About this product</Text>
                    <Text style={modalStyles.descText}>{selectedProduct.description}</Text>
                  </View>
                ) : null}

                {/* Empty Space for scrolling */}
                <View style={{ height: 20 }} />

                <PrimaryButton 
                  title="Add to Cart" 
                  onPress={() => handleAddToCartWithAnimation(selectedProduct, { x: 150, y: 500 })} 
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Flying Items for Cart Animation */}
      {flyingItems.map(item => {
        const translateX = item.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [item.startPos.x, cartPos.x - 10]
        });
        const translateY = item.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [item.startPos.y, cartPos.y - 10]
        });
        const scale = item.animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.2, 0.2]
        });
        const opacity = item.animatedValue.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0]
        });

        return (
          <Animated.Image 
            key={item.id}
            source={{ uri: item.image }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 50,
              height: 50,
              transform: [
                { translateX },
                { translateY },
                { scale }
              ],
              opacity,
              zIndex: 9999
            }}
          />
        )
      })}

      {/* Global Location Modal */}
      <Modal visible={isLocationModalVisible} transparent={true} animationType="fade">
        <View style={modalStyles.centerOverlay}>
          <View style={modalStyles.centerSheet}>
            <Text style={modalStyles.locationModalTitle}>Set Your Delivery Address</Text>
            <Text style={modalStyles.locationModalSub}>Type manually or use GPS to auto-detect your location.</Text>
            
            {/* GPS Button */}
            <TouchableOpacity
              style={modalStyles.gpsButton}
              onPress={handleUseGpsLocation}
              disabled={fetchingGpsLocation}
            >
              {fetchingGpsLocation ? (
                <><Icon name="sync-outline" size={18} color={colors.primaryDark} /><Text style={modalStyles.gpsButtonText}>  Fetching location...</Text></>
              ) : (
                <><Icon name="locate-outline" size={18} color={colors.primaryDark} /><Text style={modalStyles.gpsButtonText}>  Use Current Location</Text></>
              )}
            </TouchableOpacity>

            <Text style={[modalStyles.locationModalSub, { textAlign: 'center', marginBottom: 8 }]}>— OR type manually —</Text>

            <TextInput 
              style={modalStyles.locationInput}
              value={tempLocation}
              onChangeText={setTempLocation}
              placeholder="e.g. House 123, Street 4, Islamabad"
              multiline
            />
            
            <View style={modalStyles.locationActionRow}>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)} style={modalStyles.locationCancelBtn}>
                <Text style={modalStyles.locationCancelText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton title="Save" onPress={handleSaveLocation} style={{ flex: 1, paddingVertical: 12 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Store Closed Full Screen Overlay */}
      {!isStoreOpen && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
          <Icon name="storefront" size={80} color={colors.primaryDark} />
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: colors.primaryDark, marginTop: 24, textAlign: 'center' }}>Shop is Closed</Text>
          <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 24 }}>
            We are currently not receiving new orders. Please check back later when we are online.
          </Text>
        </View>
      )}

      {/* Rating Modal */}
      <RatingModal
        visible={isRatingModalVisible}
        orderId={unratedOrder?.id}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSubmit={handleSubmitRating}
        onCancel={handleSkipRating}
        cancelLabel="Not Now"
        loading={ratingLoading}
      />

    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  descContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  // Location Modal Styles
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerSheet: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  locationModalSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  locationInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textMain,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  locationActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  locationCancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4F0',
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
  },
  gpsButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  // Rating Modal Styles - REMOVED (now in RatingModal component)
});
