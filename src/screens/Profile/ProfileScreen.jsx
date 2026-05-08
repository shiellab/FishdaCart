import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { auth, firestore } from '../../services/firebaseConfig';
import { getUserOrders, syncUserToBackend, getUserStats } from '../../services/firestoreService';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [stats, setStats] = useState({ totalOrders: 0, lifetimeSpend: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const memberSince = useMemo(() => {
    if (!user?.metadata?.creationTime) return 'N/A';
    return new Date(user.metadata.creationTime).toLocaleDateString();
  }, [user]);

  const refreshProfileData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [orders, remoteStats] = await Promise.all([
        getUserOrders(user.uid),
        getUserStats(user.uid),
      ]);

      const calculatedSpend = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      setStats({
        totalOrders: remoteStats?.total_orders ?? orders.length,
        lifetimeSpend: remoteStats?.total_spent ?? calculatedSpend,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      refreshProfileData();
    }, [refreshProfileData]),
  );

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const cleanName = name?.trim() || null;
      const cleanPhone = phone?.trim() || null;
      const cleanAddress = address?.trim() || null;

      await auth().currentUser?.updateProfile({ displayName: cleanName || user.email?.split('@')[0] || 'Fishda User' });

      await firestore().collection('users').doc(user.uid).set(
        {
          displayName: cleanName,
          phone: cleanPhone,
          address: cleanAddress,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await syncUserToBackend({
        uid: user.uid,
        email: user.email,
        name: cleanName || user.email?.split('@')[0],
        role: user.role || 'Customer',
      });

      Alert.alert('Profile Updated', 'Your profile details were saved successfully.');
    } catch (error) {
      Alert.alert('Save Failed', error.message || 'Could not save profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No user profile available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Icon name="person" size={28} color="#0ea5e9" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{user.displayName || user.email?.split('@')[0] || 'Fishda User'}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <Text style={styles.role}>{user.role || 'Customer'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardLeft]}>
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRight]}>
          <Text style={styles.statValue}>${Number(stats.lifetimeSpend || 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Display name" placeholderTextColor="#94a3b8" />
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#94a3b8" />

        <TouchableOpacity style={[styles.primaryButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Profile</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.cardSpacing]}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.accountLine}>Member Since: {memberSince}</Text>
        <Text style={styles.accountLine}>User ID: {user.uid?.slice(0, 10)}...</Text>
      </View>

      <View style={[styles.card, styles.cardSpacing]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Orders')}>
          <Icon name="receipt-outline" size={18} color="#1e293b" />
          <Text style={styles.actionText}>View My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Fish')}>
          <Icon name="fish-outline" size={18} color="#1e293b" />
          <Text style={styles.actionText}>Browse Fish</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={refreshProfileData}>
          <Icon name="refresh-outline" size={18} color="#1e293b" />
          <Text style={styles.actionText}>{loading ? 'Refreshing...' : 'Refresh Stats'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { marginLeft: 12, flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  subtitle: { marginTop: 2, color: '#64748b', fontWeight: '500' },
  role: { marginTop: 6, color: '#0ea5e9', fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statCardLeft: { marginRight: 5 },
  statCardRight: { marginLeft: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  statLabel: { marginTop: 4, fontSize: 12, color: '#64748b', fontWeight: '600' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardSpacing: { marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  input: {
    backgroundColor: '#ffffff',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#334155',
  },
  primaryButton: {
    marginTop: 4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  accountLine: { color: '#475569', fontSize: 14, marginTop: 4, fontWeight: '500' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  actionText: { marginLeft: 10, color: '#1e293b', fontWeight: '600' },
});

export default ProfileScreen;
