import React from 'react';
import { View, Text, StyleSheet, Button, Linking } from 'react-native';
import { ADMIN_DASHBOARD_URL } from '../../config/appConfig';

const AdminPanelScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Area</Text>
      <Text style={styles.text}>
        This is a restricted screen available only for users with the Admin role.
      </Text>
      <Button 
        title="Open Laravel Web Dashboard" 
        onPress={() => Linking.openURL(ADMIN_DASHBOARD_URL)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#dc3545' },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#333' }
});

export default AdminPanelScreen;
