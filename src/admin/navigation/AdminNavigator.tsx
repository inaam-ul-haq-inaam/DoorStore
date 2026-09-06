import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';

import { AdminDashboardScreen } from '../screens/DashboardScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { AdminChatScreen } from '../screens/AdminChatScreen';
import { DeliverySettingsScreen } from '../screens/DeliverySettingsScreen';
import { AdminReviewsScreen } from '../screens/AdminReviewsScreen';
import { UsersListScreen } from '../screens/UsersListScreen';
import { UserDetailsScreen } from '../screens/UserDetailsScreen';

import { AdminDrawerParamList } from '../../navigation/types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

export const AdminNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: colors.surface,
        drawerActiveTintColor: colors.primaryDark,
        drawerInactiveTintColor: colors.textMuted,
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{
          title: 'Admin Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          title: 'Inventory',
          drawerIcon: ({ color, size }) => (
            <Icon name="layers" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{
          title: 'Product Management',
          drawerIcon: ({ color, size }) => (
            <Icon name="cube" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Inbox" 
        component={InboxScreen} 
        options={{
          title: 'Messages',
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="OrderDetail" 
        component={OrderDetailsScreen}
        options={{
          drawerItemStyle: { display: 'none' } 
        }}
      />
      <Drawer.Screen 
        name="OrdersList" 
        component={OrdersScreen} 
        options={{
          title: 'Orders',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="AdminChat" 
        component={AdminChatScreen} 
        options={{
          title: 'Chat',
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="DeliverySettings" 
        component={DeliverySettingsScreen} 
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="AdminReviews" 
        component={AdminReviewsScreen} 
        options={{
          title: 'Customer Reviews',
        }}
      />
      <Drawer.Screen 
        name="UsersList" 
        component={UsersListScreen} 
        options={{
          title: 'Customers',
          drawerIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="UserDetails" 
        component={UserDetailsScreen} 
        options={{
          title: 'User Details',
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
};
