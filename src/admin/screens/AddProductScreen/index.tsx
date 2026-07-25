import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAddProductController } from './controller';

const UNIT_OPTIONS = ['Kg', 'Grams', 'Dozen', 'Pcs', 'Pack'];
const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Meat'];

export const AddProductScreen = () => {
  const { 
    name, setName, 
    description, setDescription,
    price, setPrice, 
    stock, setStock, 
    unit, setUnit,
    unitQuantity, setUnitQuantity,
    category, setCategory,
    imageUri, handleImagePick, 
    loading, handleSaveProduct 
  } = useAddProductController();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fresh Tomatoes"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 0.48 }]}>
          <Text style={styles.label}>Price (PKR)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 0.48 }]}>
          <Text style={styles.label}>Stock Available</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            placeholder="1000"
          />
        </View>
      </View>

      {/* Category Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.unitRow}>
          {CATEGORY_OPTIONS.map((option) => (
            <TouchableOpacity 
              key={option}
              style={[
                styles.unitButton, 
                category === option && styles.unitButtonActive
              ]}
              onPress={() => setCategory(option)}
            >
              <Text style={[
                styles.unitButtonText,
                category === option && styles.unitButtonTextActive
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Unit Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Unit</Text>
        <View style={styles.unitRow}>
          {UNIT_OPTIONS.map((option) => (
            <TouchableOpacity 
              key={option}
              style={[
                styles.unitButton, 
                unit === option && styles.unitButtonActive
              ]}
              onPress={() => setUnit(option)}
            >
              <Text style={[
                styles.unitButtonText,
                unit === option && styles.unitButtonTextActive
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Base Quantity per Unit</Text>
        <TextInput
          style={styles.input}
          value={unitQuantity}
          onChangeText={setUnitQuantity}
          keyboardType="numeric"
          placeholder="e.g. 250 (for Grams) or 1 (for Kg)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Fresh and organic tomatoes straight from the farm..."
          multiline={true}
        />
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>+ Upload Product Image</Text>
        )}
      </TouchableOpacity>

      <PrimaryButton title="Save Product" onPress={handleSaveProduct} isLoading={loading} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.l,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: spacing.xl,
  },
  inputGroup: { marginBottom: spacing.m },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  unitButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unitButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: colors.primaryDark,
  },
  imagePicker: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: spacing.radiusMedium,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.textMuted,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerText: { color: colors.textMuted },
});
