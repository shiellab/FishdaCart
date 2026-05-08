import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FishListScreen from '../screens/Fish/FishListScreen';
import { getCategories } from '../services/firestoreService';
import { View, ActivityIndicator } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const TopTabs = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading tabs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#0ea5e9' },
        tabBarScrollEnabled: true,
      }}
    >
      {categories.length > 0 ? (
        categories.map((cat) => (
          <Tab.Screen key={cat.id} name={cat.name}>
            {(props) => <FishListScreen {...props} categoryId={cat.id} />}
          </Tab.Screen>
        ))
      ) : (
        <Tab.Screen name="All Fish">
          {(props) => <FishListScreen {...props} categoryId={null} />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
};

export default TopTabs;
