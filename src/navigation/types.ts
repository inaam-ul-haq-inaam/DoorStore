import { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductDetails: { productId: string };
  Checkout: { deliveryFee: number, distance: number } | undefined;
  OrderSuccess: { orderId: string };
  CustomerChat: undefined;
  Policy: undefined;
};

export type AdminDrawerParamList = {
  Dashboard: undefined;
  AddProduct: undefined;
  Inventory: undefined;
  OrdersList: { status: string };
  OrderDetail: { orderId: string };
  Inbox: undefined;
  AdminChat: { customerId: string, customerName: string };
  DeliverySettings: undefined;
  AdminReviews: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  CompleteProfile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  CustomerApp: NavigatorScreenParams<CustomerStackParamList>;
  AdminApp: NavigatorScreenParams<AdminDrawerParamList>;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type CustomerStackNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
export type AdminDrawerNavigationProp = DrawerNavigationProp<AdminDrawerParamList>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<CustomerStackParamList>
>;
