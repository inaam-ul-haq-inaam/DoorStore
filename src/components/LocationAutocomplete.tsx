import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
// @ts-ignore — lodash.debounce has no bundled types
import debounce from 'lodash.debounce';
import Icon from 'react-native-vector-icons/Ionicons';
import { GEOAPIFY_API_KEY } from '@env';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

interface LocationResult {
  placeId: string;
  formatted: string;
  lat: number;
  lon: number;
}

interface LocationAutocompleteProps {
  /** Current address string (controlled) */
  value: string;
  /** Called when location is selected from dropdown */
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  /** Called when text changes (even without selection) */
  onChangeText?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional styles for the outer container */
  containerStyle?: object;
  /** Additional styles for the TextInput */
  inputStyle?: object;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onLocationSelect,
  onChangeText,
  placeholder = 'Search delivery address...',
  containerStyle,
  inputStyle,
}) => {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState(value);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external value changes (e.g. pre-fill from profile)
  useEffect(() => {
    setInputText(value);
  }, [value]);

  const fetchSuggestions = async (text: string) => {
    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (text.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      setNetworkError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setNetworkError(null);

    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 7000);

    try {
      // Added Pakistan filter (&filter=countrycode:pk) and increased limit to 8
      const url = `${AUTOCOMPLETE_URL}?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}&filter=countrycode:pk&limit=8&format=json`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Geoapify API error:', response.status);
        setNetworkError('Could not load suggestions. Please check your internet connection.');
        setShowDropdown(true);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const items: LocationResult[] = (data.results || []).map((item: any) => ({
        placeId: item.place_id || `${item.lat}-${item.lon}`,
        formatted: item.formatted || '',
        lat: item.lat,
        lon: item.lon,
      }));

      setResults(items);
      setShowDropdown(true);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (didTimeout) {
        setNetworkError('Slow internet: Please check your internet connection.');
        setShowDropdown(true);
      } else if (error.name !== 'AbortError') {
        console.warn('Location autocomplete error:', error);
        setNetworkError('Please check your internet connection.');
        setShowDropdown(true);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Debounced fetch — 500ms delay
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((text: string) => fetchSuggestions(text), 500),
    [],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    setNetworkError(null);
    onChangeText?.(text);
    debouncedFetch(text);
  };

  const handleSelect = (item: LocationResult) => {
    setInputText(item.formatted);
    setResults([]);
    setShowDropdown(false);
    setNetworkError(null);
    Keyboard.dismiss();
    onLocationSelect(item.lat, item.lon, item.formatted);
  };

  const renderItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity style={componentStyles.resultItem} onPress={() => handleSelect(item)}>
      <Icon name="location-outline" size={18} color={colors.primaryDark} style={componentStyles.resultIcon} />
      <Text style={componentStyles.resultText} numberOfLines={2}>
        {item.formatted}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[componentStyles.container, containerStyle]}>
      <View style={componentStyles.inputWrapper}>
        <Icon name="search-outline" size={18} color={colors.textMuted} style={componentStyles.searchIcon} />
        <TextInput
          style={[componentStyles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (results.length > 0 || networkError) setShowDropdown(true);
          }}
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.primaryButton} style={componentStyles.loader} />
        )}
        {!loading && inputText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setInputText('');
              setResults([]);
              setShowDropdown(false);
              setNetworkError(null);
              onChangeText?.('');
            }}
            style={componentStyles.clearBtn}
          >
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View style={componentStyles.dropdown}>
          {networkError ? (
            <View style={componentStyles.errorContainer}>
              <Icon name="cloud-offline-outline" size={22} color={colors.danger} />
              <Text style={componentStyles.errorText}>{networkError}</Text>
              <TouchableOpacity
                style={componentStyles.retrySmallBtn}
                onPress={() => fetchSuggestions(inputText)}
              >
                <Text style={componentStyles.retrySmallText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : results.length === 0 ? (
            <View style={componentStyles.emptyContainer}>
              <Text style={componentStyles.emptyText}>No matching address found</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.placeId}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              ItemSeparatorComponent={() => <View style={componentStyles.separator} />}
            />
          )}
        </View>
      )}
    </View>
  );
};

const componentStyles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    paddingVertical: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  resultIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  retrySmallBtn: {
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retrySmallText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
