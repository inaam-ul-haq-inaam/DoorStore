/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-firebase/auth', () => {
  const auth = jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  }));

  return {
    __esModule: true,
    default: auth,
  };
});

jest.mock('@react-native-firebase/firestore', () => {
  const firestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false })),
      })),
    })),
  }));

  return {
    __esModule: true,
    default: firestore,
  };
});

jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
