import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/Home/HomeScreen';
import FishTabs from './TopTabs';
import CartScreen from '../screens/Cart/CartScreen';
import AquariumScreen from '../screens/Aquarium/AquariumScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Fish') iconName = focused ? 'fish' : 'fish-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Aquarium') iconName = focused ? 'water' : 'water-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={size + 2} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9', // Premium Ocean Blue
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60, elevation: 15, borderTopWidth: 0, backgroundColor: '#ffffff' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fish" component={FishTabs} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Aquarium" component={AquariumScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
