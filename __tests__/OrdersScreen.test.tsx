import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useOrdersFetch } from '../src/hooks/useOrdersFetch';
import { useOrdersController } from '../src/customer/screens/OrdersScreen/controller';

jest.mock('../src/services/firebase', () => ({
  firebaseAuth: { currentUser: { uid: 'customer-1' } },
  firebaseDb: {},
}));

jest.mock('../src/hooks/useOrdersFetch', () => ({
  useOrdersFetch: jest.fn(),
}));

// Native modules — jest environment me TurboModule nahi hota, isliye yahan mock.
jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: { saveAsset: jest.fn() },
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

const order = {
  id: 'order-12345678',
  customer_id: 'customer-1',
  customer_name: 'Customer',
  status: 'incoming' as const,
  total_amount: 25,
  created_at: '2026-10-14T00:00:00.000Z',
  items: [{ quantity: 1 }],
};

const OrderTrackingHarness = () => {
  const { filteredOrders, trackingOrder, openOrderTracking } = useOrdersController();

  return (
    <>
      {filteredOrders.map(item => (
        <button key={item.id} onClick={() => openOrderTracking(item)}>
          {item.id}
        </button>
      ))}
      <span>{trackingOrder?.id}</span>
    </>
  );
};

test('tracking stays open for the tapped order when the order list refreshes', () => {
  (useOrdersFetch as jest.Mock).mockReturnValue({ orders: [order], loading: false });

  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<OrderTrackingHarness />);
  });

  const orderButton = renderer!.root.findByType('button');
  ReactTestRenderer.act(() => {
    orderButton.props.onClick();
  });

  expect(renderer!.root.findByType('span').children).toEqual([order.id]);

  (useOrdersFetch as jest.Mock).mockReturnValue({ orders: [], loading: false });
  ReactTestRenderer.act(() => {
    renderer!.update(<OrderTrackingHarness />);
  });

  expect(renderer!.root.findByType('span').children).toEqual([order.id]);
});
