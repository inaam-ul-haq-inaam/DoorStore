import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-firebase/auth', () => {
  const signInWithPhoneNumber = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({ signInWithPhoneNumber })),
    __signInWithPhoneNumber: signInWithPhoneNumber,
  };
});

jest.mock('@react-navigation/native', () => {
  const confirm = jest.fn();
  return {
    __esModule: true,
    useRoute: () => ({
      params: { phone: '+923001234567', confirmation: { confirm } },
    }),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: () => true,
    }),
    __confirm: confirm,
  };
});

import { useOtpController } from '../src/auth/screens/OtpScreen/controller';

type OtpController = ReturnType<typeof useOtpController>;

const authMock = require('@react-native-firebase/auth');
const navMock = require('@react-navigation/native');
const confirmMock = navMock.__confirm as jest.Mock;
const signInMock = authMock.__signInWithPhoneNumber as jest.Mock;

let controller: OtpController;
let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

const Harness = () => {
  controller = useOtpController();
  return null;
};

const renderController = () => {
  if (renderer) {
    ReactTestRenderer.act(() => renderer!.unmount());
    renderer = null;
  }
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  renderController();
});

afterEach(() => {
  if (renderer) {
    ReactTestRenderer.act(() => renderer!.unmount());
    renderer = null;
  }
  jest.useRealTimers();
});

test('auto-verifies without a button as soon as the 6th digit is entered', async () => {
  confirmMock.mockResolvedValue(undefined);

  await ReactTestRenderer.act(async () => {
    controller.handleCodeChange('12345');
  });
  expect(confirmMock).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    controller.handleCodeChange('123456');
  });
  expect(confirmMock).toHaveBeenCalledWith('123456');
  expect(controller.status).toBe('verified');
});

test('shows Invalid OTP and clears the input when the code is wrong', async () => {
  confirmMock.mockRejectedValue({ code: 'auth/invalid-verification-code' });

  await ReactTestRenderer.act(async () => {
    controller.handleCodeChange('000000');
  });

  expect(confirmMock).toHaveBeenCalledWith('000000');
  expect(controller.error).toMatch(/Invalid OTP/);
  expect(controller.code).toBe('');
  expect(controller.status).toBe('idle');

  // Retry allowed after failure
  await ReactTestRenderer.act(async () => {
    controller.handleCodeChange('111111');
  });
  expect(confirmMock).toHaveBeenCalledTimes(2);
});

test('maps expired-code errors to the resend message', async () => {
  confirmMock.mockRejectedValue({ code: 'auth/session-expired' });

  await ReactTestRenderer.act(async () => {
    controller.handleCodeChange('123123');
  });

  expect(controller.error).toMatch(/expired/i);
});

test('resend is blocked by the timer, then re-sends the OTP after it expires', async () => {
  jest.useFakeTimers();
  renderController();

  expect(controller.resendIn).toBe(60);

  await ReactTestRenderer.act(async () => {
    await controller.handleResend();
  });
  expect(signInMock).not.toHaveBeenCalled();

  signInMock.mockResolvedValue({ confirm: jest.fn() });

  // Har tick alag act me — taake React effect (naya setTimeout) flush ho sake.
  for (let i = 0; i < 60; i++) {
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1000);
    });
  }
  expect(controller.resendIn).toBe(0);

  await ReactTestRenderer.act(async () => {
    await controller.handleResend();
  });
  expect(signInMock).toHaveBeenCalledWith('+923001234567');
});
