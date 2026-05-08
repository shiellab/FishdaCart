import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = () => {
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Logout Failed', error.message || 'Could not log out right now.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your FishdaCart app</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Get useful reminders and promo alerts</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Order Status Alerts</Text>
            <Text style={styles.settingDescription}>Receive updates when your orders change</Text>
          </View>
          <Switch value={orderUpdatesEnabled} onValueChange={setOrderUpdatesEnabled} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 8 },
  subtitle: { color: '#64748b', marginTop: 6, marginBottom: 20, fontSize: 14, fontWeight: '500' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingText: { flex: 1, paddingRight: 12 },
  settingTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  settingDescription: { marginTop: 3, color: '#64748b', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 15 }
});

export default SettingsScreen;
