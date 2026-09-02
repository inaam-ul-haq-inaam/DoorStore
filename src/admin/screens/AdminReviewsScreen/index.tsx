import React from 'react';
import { View, Text, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAdminReviewsController, ReviewOrder } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';

export const AdminReviewsScreen = () => {
  const { reviews, loading, handleGoBack } = useAdminReviewsController();

  const renderReviewCard = ({ item }: { item: ReviewOrder }) => {
    const date = new Date(item.created_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon 
              key={star}
              name={star <= item.rating ? "star" : "star-outline"} 
              size={18} 
              color={star <= item.rating ? "#FBBF24" : "#D1D5DB"} 
            />
          ))}
          <Text style={styles.ratingText}>{item.rating}.0</Text>
        </View>

        {!!item.review_text && (
          <Text style={styles.reviewText}>"{item.review_text}"</Text>
        )}

        <Text style={styles.orderIdText}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <TouchableOpacity onPress={handleGoBack} style={{ position: 'absolute', left: 0, padding: 8 }}>
            <Icon name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Reviews</Text>
        </View>
      </View>

      {loading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderReviewCard}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="star-half-outline"
              title="No Reviews Yet"
              subtitle="Once customers start rating their delivered orders, the reviews will appear here."
              iconSize={80}
              iconColor="#D1D5DB"
            />
          }
        />
      )}
    </View>
  );
};
