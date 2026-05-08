import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, View, Text, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomTabs from './BottomTabs';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import CareGuidesScreen from '../screens/CareGuides/CareGuidesScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AdminPanelScreen from '../screens/Admin/AdminPanelScreen';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

const LogoutScreen = () => {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>Are you sure you want to logout?</Text>
      <Button title="Logout Now" onPress={logout} color="red" />
    </View>
  );
};

const DrawerNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Drawer.Navigator
      initialRouteName="HomeTabs"
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingLeft: 18 }}>
            <Icon name="menu" size={32} color="#0f172a" />
          </TouchableOpacity>
        ),
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        headerStyle: { elevation: 0, shadowOpacity: 0 },
        drawerActiveTintColor: '#0ea5e9',
        drawerInactiveTintColor: '#475569',
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' }
      })}
    >
      <Drawer.Screen 
        name="HomeTabs" 
        component={BottomTabs} 
        options={{ title: 'FishdaCart', drawerIcon: ({ color }) => <Icon name="home" size={24} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ drawerIcon: ({ color }) => <Icon name="receipt" size={24} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Care Guides" 
        component={CareGuidesScreen} 
        options={{ drawerIcon: ({ color }) => <Icon name="book" size={24} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ drawerIcon: ({ color }) => <Icon name="settings" size={24} color={color} /> }} 
      />
      
      {user?.role === 'Admin' && (
        <Drawer.Screen 
          name="Admin Panel" 
          component={AdminPanelScreen} 
          options={{ drawerIcon: ({ color }) => <Icon name="shield-checkmark" size={24} color={color} /> }} 
        />
      )}

      <Drawer.Screen 
        name="Logout" 
        options={{ drawerIcon: ({ color }) => <Icon name="log-out" size={24} color="red" /> }} 
        component={LogoutScreen} 
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
