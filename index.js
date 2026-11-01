/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

/**
 * Headless background handler (register karna index.js top-level par zaroori hai).
 * Android par FCM ke `notification` payload ko system tray khud dikhata hai —
 * background aur terminated dono haalat me. Yahan sirf lightweight logging hai;
 * koi UI, credential ya token print nahi hota.
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (__DEV__) {
    console.log(
      '[push] background message:',
      remoteMessage.messageId,
      remoteMessage.data?.type || '',
    );
  }
});

AppRegistry.registerComponent(appName, () => App);
