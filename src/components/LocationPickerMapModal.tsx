import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { GEOAPIFY_API_KEY } from '@env';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface LocationPickerMapModalProps {
  visible: boolean;
  initialLat: number;
  initialLng: number;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: string) => void;
}

export const LocationPickerMapModal: React.FC<LocationPickerMapModalProps> = ({
  visible,
  initialLat,
  initialLng,
  onClose,
  onConfirm,
}) => {
  const [currentLat, setCurrentLat] = useState(initialLat || 33.6844);
  const [currentLng, setCurrentLng] = useState(initialLng || 73.0479);
  const [address, setAddress] = useState<string>('Moving pin to location...');
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Update center when modal opens or coordinates change
  useEffect(() => {
    if (visible && initialLat && initialLng) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      fetchReverseGeocode(initialLat, initialLng);
    }
  }, [visible, initialLat, initialLng]);

  // Reverse geocoding via Geoapify API (Fast, Reliable & Key-backed)
  const fetchReverseGeocode = async (lat: number, lng: number) => {
    setFetchingAddress(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}&format=json`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const first = data.results && data.results[0];
        if (first) {
          // Construct friendly human readable address
          const parts = [
            first.street || first.road || first.name,
            first.suburb || first.neighbourhood || first.district,
            first.city || first.county || first.state,
          ].filter(Boolean);

          if (parts.length > 0) {
            setAddress(parts.join(', '));
            return;
          } else if (first.formatted) {
            setAddress(first.formatted);
            return;
          }
        }
      }

      setAddress('Selected Pin Location, Pakistan');
    } catch (e: any) {
      console.warn('Reverse geocode error:', e);
      setAddress('Selected Pin Location, Pakistan');
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PIN_MOVED') {
        setCurrentLat(data.lat);
        setCurrentLng(data.lng);
        fetchReverseGeocode(data.lat, data.lng);
      }
    } catch (e) {
      console.warn('Map message error:', e);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
          .center-marker {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -100%);
            z-index: 1000;
            pointer-events: none;
          }
          .pin-shadow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 14px;
            height: 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            z-index: 999;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="pin-shadow"></div>
        <div class="center-marker">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#047857">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${currentLat}, ${currentLng}], 17);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var debounceTimer;
          map.on('moveend', function() {
            var center = map.getCenter();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PIN_MOVED',
                lat: center.lat,
                lng: center.lng
              }));
            }, 300);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBackBtn}>
            <Icon name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={styles.headerTitle}>Pinpoint Delivery Location</Text>
            <Text style={styles.headerSubtitle}>Drag the map to place the pin on your exact doorstep</Text>
          </View>
        </View>

        {/* Leaflet Map in WebView */}
        <View style={styles.mapWrapper}>
          {React.createElement(WebView as any, {
            ref: webViewRef,
            source: { html: mapHtml },
            style: styles.webview,
            onMessage: handleMessage,
            javaScriptEnabled: true,
            domStorageEnabled: true,
            startInLoadingState: true,
            renderLoading: () => (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
                <Text style={{ marginTop: 8, color: colors.textMuted }}>Loading Map...</Text>
              </View>
            ),
          })}
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <View style={styles.addressRow}>
            <Icon name="location" size={24} color={colors.primaryDark} style={{ marginRight: 10, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
              {fetchingAddress ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                  <Text style={[styles.addressText, { marginLeft: 6, color: colors.textMuted }]}>
                    Detecting exact address...
                  </Text>
                </View>
              ) : (
                <Text style={styles.addressText} numberOfLines={3}>
                  {address}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => {
              onConfirm(currentLat, currentLng, address);
              onClose();
            }}
          >
            <Text style={styles.confirmBtnText}>Confirm This Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    zIndex: 10,
  },
  headerBackBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  mapLoading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    backgroundColor: '#FFF',
    padding: spacing.l,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  confirmBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
