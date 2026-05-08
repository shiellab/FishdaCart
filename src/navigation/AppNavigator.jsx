import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import Navigators
import DrawerNavigator from './DrawerNavigator';

// Mock Screens for Auth for now
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

import FishDetailsScreen from '../screens/Fish/FishDetailsScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Cart/CheckoutScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // When logged in, show the Drawer containing Main App
        <Stack.Group>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="FishDetails" component={FishDetailsScreen} options={{ headerShown: true, title: 'Fish Details' }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
        </Stack.Group>
      ) : (
        // When not logged in, show Auth Flow
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
