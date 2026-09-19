import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useEditProductController, UNIT_OPTIONS, CATEGORY_OPTIONS } from './controller';

export const EditProductScreen = () => {
  const {
    loadingProduct,
    name, setName,
    description, setDescription,
    price, setPrice,
    stock, setStock,
    unit, setUnit,
    unitQuantity, setUnitQuantity,
    category, setCategory,
    imageUrl, handleImagePick,
    saving, handleSaveChanges,
  } = useEditProductController();

  if (loadingProduct) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit Product</Text>

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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.unitRow}>
          {CATEGORY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.unitButton,
                category === option && styles.unitButtonActive,
              ]}
              onPress={() => setCategory(option)}
            >
              <Text style={[
                styles.unitButtonText,
                category === option && styles.unitButtonTextActive,
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Unit</Text>
        <View style={styles.unitRow}>
          {UNIT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.unitButton,
                unit === option && styles.unitButtonActive,
              ]}
              onPress={() => setUnit(option)}
            >
              <Text style={[
                styles.unitButtonText,
                unit === option && styles.unitButtonTextActive,
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
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>+ Change Product Image</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.imageHint}>Tap image to replace it (optional)</Text>

      <PrimaryButton title="Save Changes" onPress={handleSaveChanges} isLoading={saving} />
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loaderText: {
    marginTop: spacing.m,
    fontSize: 14,
    color: colors.textMuted,
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
    marginBottom: 6,
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
  imageHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.l,
  },
});
