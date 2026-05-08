import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebaseConfig';

const CheckoutScreen = ({ navigation }) => {
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Error', 'Please fill in address and phone number.');
      return;
    }
    const userUid = user?.uid || user?.firebase_uid;
    if (!userUid) {
      Alert.alert('Account Issue', 'Could not find your user ID. Please sign out and sign in again.');
      return;
    }

    setLoading(true);
    try {
      // Force refresh Firebase token to fix timestamp issues
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.getIdToken(true); // true = force refresh
      }

      const orderData = {
        userId: userUid,
        items: cart,
        total: totalAmount,
        address,
        phone,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const result = await placeOrder(orderData);
      
      if (result.success) {
        clearCart();
        Alert.alert(
          'Order Placed!',
          `Your order ${result.orderId} has been successfully placed.`,
          [{ text: 'Track Order', onPress: () => navigation.navigate('Main', { screen: 'Orders' }) }]
        );
      }
    } catch (error) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('issued in the future') || errorMsg.includes('timestamp')) {
        Alert.alert(
          'Token Error - Sign Out Required',
          'The Firebase token was issued with wrong time. Please:\n\n1. Sign out and sign back in\n2. Or restart the app\n3. Then try placing order again',
          [
            { text: 'OK' },
            { 
              text: 'Sign Out Now', 
              onPress: async () => {
                await auth().signOut();
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMsg || 'Failed to place order. Try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.itemText}>{item.name} x {item.quantity}</Text>
            <Text style={styles.priceText}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable:</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Delivery Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentText}>Cash on Delivery (Default)</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.placeOrderBtn, loading && { backgroundColor: '#ccc' }]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderText}>Confirm & Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { color: '#666' },
  priceText: { color: '#333', fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#007bff' },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  paymentCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  paymentText: { color: '#007bff', fontWeight: 'bold' },
  placeOrderBtn: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50,
  },
  placeOrderText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CheckoutScreen;
