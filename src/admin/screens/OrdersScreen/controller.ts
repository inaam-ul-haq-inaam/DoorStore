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
import { doorStoreLogoBase64 } from '../../../assets/logoBase64';
import { notifyBuyerOfStatusChange } from '../../../services/buyerNotification';
import { formatOrderItemQuantity } from '../../../utils/itemQuantity';

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
  distance_km?: number;
  delivery_fee?: number | 'Pending';
  customer_id?: string;
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
      return true; 
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
    if (selectedOrder) {
      const stillExists = orders.find(o => o.id === selectedOrder.id);
      if (!stillExists) {
        setSelectedOrder(null);
      } else if (
        stillExists.items?.length !== selectedOrder.items?.length ||
        stillExists.total_amount !== selectedOrder.total_amount
      ) {
        setSelectedOrder(stillExists);
      }
    }
  }, [orders, selectedOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await firebaseDb.collection('orders').doc(orderId).update({ status: newStatus });
      // Buyer ko status change ki notification (fire-and-forget, kabhi throw nahi karta)
      notifyBuyerOfStatusChange(orderId, newStatus, selectedOrder?.customer_id);
      setSelectedOrder(null); 
    } catch (error) {
      console.error('Error updating order status', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleRemoveItem = (index: number) => {
    if (!selectedOrder) return;
    const items: any[] = selectedOrder.items || [];
    const item = items[index];
    if (!item) return;

    if (items.length === 1) {
      Alert.alert(
        'Last Item',
        'This is the only item in the order. Please cancel the order instead.',
      );
      return;
    }

    Alert.alert(
      'Remove Item?',
      `Remove ${item.quantity}x ${item.name} from this order? The total will be recalculated automatically.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const remaining = items.filter((_: any, i: number) => i !== index);
              const itemsSubtotal = remaining.reduce(
                (sum: number, it: any) =>
                  sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
                0,
              );
              const deliveryFee = typeof selectedOrder.delivery_fee === 'number'
                ? selectedOrder.delivery_fee
                : 0;
              const newTotal = itemsSubtotal + deliveryFee;

              await firebaseDb.collection('orders').doc(selectedOrder.id).update({
                items: remaining,
                total_amount: newTotal,
                totalAmount: newTotal,
              });
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Could not remove the item.');
            }
          },
        },
      ],
    );
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    const shortId = `#${selectedOrder.id.slice(0, 6).toUpperCase()}`;
    Alert.alert(
      'Cancel Entire Order?',
      `Are you sure you want to cancel order ${shortId}? The customer will see this status in their app. This cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseDb.collection('orders').doc(selectedOrder.id).update({
                status: 'cancelled',
              });
              // Buyer ko cancel ki notification (fire-and-forget)
              notifyBuyerOfStatusChange(selectedOrder.id, 'cancelled', selectedOrder.customer_id);
              setSelectedOrder(null);
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Could not cancel the order.');
            }
          },
        },
      ],
    );
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
    const fee = parseInt(inputDeliveryFee, 10);
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
    } catch {
      Alert.alert('Error', 'Could not update delivery fee.');
    }
    setIsUpdatingFee(false);
  };

  const handlePrintBill = async () => {
    if (!selectedOrder) return;

    const formatCurrency = (value: number | string | undefined) => {
      const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
      return `Rs. ${Number.isFinite(numericValue) ? numericValue.toFixed(2) : '0.00'}`;
    };

    const escapeHtml = (value: string | number | undefined) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const logoData = `data:image/png;base64,${doorStoreLogoBase64}`;
    const storePhone = '03025769675';
    const storeTitle = 'CHUNG LAHORE';

    const itemsMarkup = (selectedOrder.items || [])
      .map((item) => {
        const quantityLabel = formatOrderItemQuantity(item);
        const price = Number(item?.price ?? 0) * (Number(item?.quantity ?? 0) || 0);
        const itemName = escapeHtml(item?.name ?? 'Item');
        return `
          <div class="item Row">
            <div class="itemName">${itemName}</div>
            <div class="itemQty">${quantityLabel}</div>
            <div class="itemPrice">${formatCurrency(price)}</div>
          </div>`;
      })
      .join('');

    const deliveryFee = typeof selectedOrder.delivery_fee === 'number' ? selectedOrder.delivery_fee : 0;
    const isPending = selectedOrder.delivery_fee === 'Pending';
    const totalAmount = Number(selectedOrder.total_amount ?? 0);
    const subtotal = isPending ? totalAmount : Math.max(0, totalAmount - deliveryFee);
    const date = selectedOrder.created_at ? new Date(selectedOrder.created_at) : new Date();
    const dateStr = date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const html = `
      <html>
        <head>
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f2f2f2;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #111;
              display: flex;
              justify-content: center;
              padding: 14px 0;
            }
            .receipt {
              width: 100%;
              max-width: 320px;
              background: #f6f4f1;
              border: 1px solid rgba(0,0,0,0.12);
              padding: 14px 12px 18px 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .topBlock {
              text-align: center;
              margin-bottom: 6px;
            }
            .logo {
              width: 76px;
              height: 76px;
              object-fit: contain;
              border-radius: 10px;
              margin: 0 auto 4px;
              display: block;
            }
            h1 {
              margin: 0;
              font-size: 30px;
              line-height: 0.94;
              letter-spacing: 0.5px;
              font-weight: 900;
              text-transform: uppercase;
              color: #111;
            }
            .tagline {
              font-size: 15px;
              font-weight: 700;
              color: #111;
              margin-top: 2px;
              margin-bottom: 4px;
            }
            .storeTitle {
              font-size: 26px;
              font-weight: 900;
              color: #111;
              margin-top: 2px;
              letter-spacing: 0.5px;
            }
            .whatsApp {
              font-size: 15px;
              font-weight: 700;
              margin-top: 4px;
              color: #111;
            }
            .divider {
              border-top: 2px dashed rgba(0,0,0,0.8);
              margin: 10px 0 8px;
            }
            .sectionTitle {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              margin: 8px 0 4px;
              letter-spacing: 0.5px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 8px;
              margin: 3px 0;
              font-size: 14px;
              line-height: 1.35;
            }
            .label {
              font-weight: 700;
              color: #111;
              min-width: 92px;
            }
            .value {
              flex: 1;
              text-align: right;
              color: #111;
              font-weight: 700;
              word-break: break-word;
            }
            .itemsWrap {
              margin-top: 6px;
            }
            .item {
              display: grid;
              grid-template-columns: 1fr auto auto;
              gap: 8px;
              align-items: start;
              margin: 4px 0;
              font-size: 14px;
            }
            .itemName {
              font-size: 13px;
              font-weight: 700;
              line-height: 1.3;
              color: #111;
            }
            .itemQty {
              min-width: 26px;
              text-align: right;
              font-size: 13px;
              font-weight: 700;
              color: #111;
            }
            .itemPrice {
              min-width: 78px;
              text-align: right;
              font-size: 13px;
              font-weight: 700;
              color: #111;
            }
            .totals {
              margin-top: 8px;
            }
            .totalLine {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
              margin: 4px 0;
              line-height: 1.35;
            }
            .totalLine strong {
              font-weight: 900;
            }
            .grandTotal {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;
              padding-top: 6px;
              border-top: 2px solid rgba(0,0,0,0.8);
              font-weight: 900;
            }
            .grandTotal .label {
              font-size: 18px;
              min-width: 0;
            }
            .grandTotal .value {
              font-size: 30px;
              letter-spacing: 0.2px;
            }
            .footerText {
              text-align: center;
              font-size: 15px;
              font-weight: 700;
              margin-top: 12px;
              line-height: 1.4;
            }
            .miniNote {
              font-size: 11px;
              color: #111;
              text-align: center;
              margin-top: 8px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="topBlock">
              <img class="logo" src="${logoData}" alt="Door Store Logo" />
              <h1>Door Store</h1>
              <div class="tagline">Your fresh food partner</div>
              <div class="storeTitle">${escapeHtml(storeTitle)}</div>
              <div class="whatsApp">WhatsApp: ${escapeHtml(storePhone)}</div>
            </div>

            <div class="divider"></div>

            <div class="sectionTitle">Order Details</div>
            <div class="row"><span class="label">Order ID:</span><span class="value">#${escapeHtml(selectedOrder.id.slice(0, 8).toUpperCase())}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${escapeHtml(dateStr)}</span></div>

            <div class="divider"></div>

            <div class="sectionTitle">Customer Details</div>
            <div class="row"><span class="label">Customer:</span><span class="value">${escapeHtml(selectedOrder.customer_name)}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">+${escapeHtml(selectedOrder.customer_phone.replace(/[^\d+]/g, ''))}</span></div>
            <div class="row"><span class="label">Address:</span><span class="value">${escapeHtml(selectedOrder.delivery_address)}</span></div>

            <div class="divider"></div>

            <div class="sectionTitle">Items</div>
            <div class="itemsWrap">${itemsMarkup}</div>

            <div class="divider"></div>

            <div class="totals">
              <div class="totalLine"><span>Subtotal:</span><strong>${formatCurrency(subtotal)}</strong></div>
              ${isPending ? '<div class="totalLine"><span>Delivery Fee:</span><strong>Pending</strong></div>' : (deliveryFee > 0 ? `<div class="totalLine"><span>Delivery Fee:</span><strong>${formatCurrency(deliveryFee)}</strong></div>` : '')}
              ${selectedOrder.distance_km ? `<div class="totalLine"><span>Distance:</span><strong>${selectedOrder.distance_km.toFixed(2)} KM</strong></div>` : ''}
              <div class="grandTotal"><span class="label">TOTAL:</span><span class="value">${formatCurrency(totalAmount)}</span></div>
            </div>

            <div class="divider"></div>

            <div class="footerText">Thank you for your order!</div>
            <div class="miniNote">We appreciate you choosing DOOR STORE<br />— your fresh food partner.</div>
          </div>
        </body>
      </html>
    `;

    try {
      await RNPrint.print({ html });
    } catch {
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
    handleRemoveItem,
    handleCancelOrder,
    viewRef,
    handleSaveReceipt,
    handlePrintBill
  };
};
