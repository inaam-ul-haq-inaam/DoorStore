import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { firebaseDb } from '../../../services/firebase';
import { AdminDrawerParamList } from '../../../navigation/types';
import { useShopLocationCache } from '../../../hooks/useShopLocationCache';
import { useOrdersFetch } from '../../../hooks/useOrdersFetch';
import { Linking, Alert, Platform, PermissionsAndroid } from 'react-native';
import { useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNPrint from 'react-native-print';

type OrdersScreenRouteProp = RouteProp<AdminDrawerParamList, 'OrdersList'>;

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  items: any[];
  created_at: string;
  created_at: string;
  delivery_fee?: number | 'Pending';
}

export const useOrdersController = () => {
  const route = useRoute<OrdersScreenRouteProp>();
  const { status } = route.params;

  const { shopLocation } = useShopLocationCache();
  const shopAddress = shopLocation?.address || '';

  const { orders, loading } = useOrdersFetch<Order>({
    filters: [{ field: 'status', operator: '==', value: status }],
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inputDeliveryFee, setInputDeliveryFee] = useState('');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const viewRef = useRef<any>(null);

  const hasAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 29) {
      return true; // Android 10+ uses scoped storage
    }

    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) return true;

    const reqStatus = await PermissionsAndroid.request(permission);
    return reqStatus === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleSaveReceipt = async () => {
    try {
      if (!viewRef.current) return;
      const hasPerm = await hasAndroidPermission();
      if (!hasPerm) {
        Alert.alert('Permission Denied', 'Storage permission is required to save the receipt.');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      await CameraRoll.saveAsset(uri, { type: 'photo' });
      Alert.alert('Success', 'Receipt saved to gallery!');
    } catch (error) {
      console.log('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt.');
    }
  };

  useEffect(() => {
    // If the selected order status changes, we might want to close the modal if it moved out of this list
    if (selectedOrder) {
      const stillExists = orders.find(o => o.id === selectedOrder.id);
      if (!stillExists) {
        setSelectedOrder(null);
      }
    }
  }, [orders, selectedOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await firebaseDb.collection('orders').doc(orderId).update({ status: newStatus });
      setSelectedOrder(null); // Close modal on action
    } catch (error) {
      console.error('Error updating order status', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setInputDeliveryFee(order.delivery_fee && order.delivery_fee !== 'Pending' ? order.delivery_fee.toString() : '');
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setInputDeliveryFee('');
  };

  const handleUpdateDeliveryFee = async () => {
    if (!selectedOrder || !inputDeliveryFee) return;
    const fee = parseInt(inputDeliveryFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsUpdatingFee(true);
    try {
      const newTotal = selectedOrder.total_amount + fee;
      await firebaseDb.collection('orders').doc(selectedOrder.id).update({
        delivery_fee: fee,
        total_amount: newTotal
      });
      setSelectedOrder({ ...selectedOrder, delivery_fee: fee, total_amount: newTotal });
      Alert.alert('Success', 'Delivery fee updated.');
    } catch (e) {
      Alert.alert('Error', 'Could not update delivery fee.');
    }
    setIsUpdatingFee(false);
  };

  const handlePrintBill = async () => {
    if (!selectedOrder) return;
    const itemsRows = selectedOrder.items
      .map(
        (item) =>
          `<tr>
            <td>${item.name}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">Rs. ${(item.price * item.quantity).toFixed(0)}</td>
          </tr>`
      )
      .join('');

    const deliveryFee = typeof selectedOrder.delivery_fee === 'number' ? selectedOrder.delivery_fee : 0;
    const isPending = selectedOrder.delivery_fee === 'Pending';
    const subtotal = isPending ? selectedOrder.total_amount : selectedOrder.total_amount - deliveryFee;
    const dateStr = selectedOrder.created_at
      ? new Date(selectedOrder.created_at).toLocaleString()
      : new Date().toLocaleString();

    const html = `
      <html><head><style>
        @page { margin: 0; size: 75mm auto; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 10px; color: #000; font-size: 12px; max-width: 300px; margin: 0 auto; }
        h1 { text-align: center; font-size: 18px; letter-spacing: 1px; color: #000; margin-bottom: 2px; }
        p.sub { text-align: center; color: #333; font-size: 10px; margin-top: 0; margin-bottom: 10px; }
        hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        th { text-align: left; font-size: 11px; color: #000; padding-bottom: 4px; border-bottom: 1px solid #000; }
        td { padding: 4px 0; font-size: 12px; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
        .row span:first-child { font-weight: bold; }
        .total { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
        .footer { text-align: center; margin-top: 15px; font-size: 11px; color: #333; font-weight: bold; }
      </style></head><body>
        <h1>DOOR STORE</h1>
        <p class="sub">Your fresh food partner</p>
        <hr/>
        <div class="row"><span>Order ID:</span><span>#${selectedOrder.id.slice(0,8).toUpperCase()}</span></div>
        <div class="row"><span>Date:</span><span>${dateStr}</span></div>
        <div class="row"><span>Customer:</span><span>${selectedOrder.customer_name}</span></div>
        <div class="row"><span>Phone:</span><span>${selectedOrder.customer_phone}</span></div>
        <div class="row"><span>Address:</span><span>${selectedOrder.delivery_address}</span></div>
        <hr/>
        <table>
          <tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr>
          ${itemsRows}
        </table>
        <hr/>
        <div class="row"><span>Subtotal:</span><span>Rs. ${subtotal.toFixed(2)}</span></div>
        ${isPending ? '<div class="row"><span>Delivery Fee:</span><span>Pending</span></div>' : (deliveryFee > 0 ? `<div class="row"><span>Delivery Fee:</span><span>Rs. ${deliveryFee.toFixed(2)}</span></div>` : '')}
        ${selectedOrder.distance_km ? `<div class="row"><span>Distance:</span><span>${selectedOrder.distance_km.toFixed(2)} KM</span></div>` : ''}
        <div class="row total"><span>TOTAL:</span><span>Rs. ${selectedOrder.total_amount.toFixed(2)} ${isPending ? '(+ Delivery)' : ''}</span></div>
        <hr/>
        <p class="footer">Thank you for your order!</p>
      </body></html>
    `;
    try {
      await RNPrint.print({ html });
    } catch (e) {
      Alert.alert('Error', 'Could not open printer.');
    }
  };

  const openGoogleMapsRoute = async (buyerAddress: string) => {
    if (!shopAddress) {
      Alert.alert('Shop Location Not Set', 'Please set your shop location on the dashboard first to get directions.');
      return;
    }
    if (!buyerAddress) {
      Alert.alert('Buyer Address Missing', 'This order does not have a valid delivery address.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(shopAddress)}&destination=${encodeURIComponent(buyerAddress)}`;
    
    try {
      // Direct openURL is better for Android 11+ without needing AndroidManifest changes
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Failed to open map. Please make sure you have a browser or Google Maps installed.');
    }
  };

  return { 
    status, 
    orders, 
    loading, 
    selectedOrder,
    openOrderDetails,
    closeOrderDetails,
    inputDeliveryFee,
    setInputDeliveryFee,
    isUpdatingFee,
    handleUpdateDeliveryFee,
    updateOrderStatus, 
    openGoogleMapsRoute,
    viewRef,
    handleSaveReceipt,
    handlePrintBill
  };
};
