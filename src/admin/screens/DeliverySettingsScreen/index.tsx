import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDeliverySettingsController } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { ScreenLoader } from '../../../components/ScreenLoader';

export const DeliverySettingsScreen = () => {
  const {
    baseFee,
    setBaseFee,
    perKmFee,
    setPerKmFee,
    loading,
    fetching,
    handleSave,
    handleGoBack
  } = useDeliverySettingsController();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color={colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Settings</Text>
      </View>

      {fetching ? (
        <ScreenLoader />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Base Delivery Fee (Rs.)</Text>
          <TextInput
            style={styles.input}
            value={baseFee}
            onChangeText={setBaseFee}
            keyboardType="numeric"
            placeholder="e.g. 50"
          />
          <Text style={styles.infoText}>Fixed fee charged for every order regardless of distance.</Text>

          <Text style={styles.label}>Per Kilometer Fee (Rs.)</Text>
          <TextInput
            style={styles.input}
            value={perKmFee}
            onChangeText={setPerKmFee}
            keyboardType="numeric"
            placeholder="e.g. 20"
          />
          <Text style={styles.infoText}>Additional fee charged per KM distance from your shop.</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
