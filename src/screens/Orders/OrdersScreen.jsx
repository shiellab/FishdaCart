import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders, getAllOrders, updateOrderStatus, cancelOrder } from '../../services/firestoreService';
import { useFocusEffect } from '@react-navigation/native';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const OrdersScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const canManageOrders = ['Admin', 'Breeder', 'Vendor'].includes(user?.role);
  const userUid = user?.uid || user?.firebase_uid;

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    if (!canManageOrders && !userUid) {
      setOrders([]);
      return;
    }

    const fetchedOrders = canManageOrders ? await getAllOrders() : await getUserOrders(userUid);
    const formattedOrders = fetchedOrders.map(data => ({
      ...data,
      date: data.createdAt || data.created_at ? new Date(data.createdAt || data.created_at).toLocaleDateString() : 'N/A',
      total: Number(data.total)
    }));
    setOrders(formattedOrders);
  }, [canManageOrders, user, userUid]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders().finally(() => setLoading(false));
    }, [fetchOrders])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This will restore stock.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingOrderId(orderId);
              await cancelOrder(orderId);
              await fetchOrders();
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error) {
              Alert.alert('Cancel Failed', error.message || 'Could not cancel order.');
            } finally {
              setUpdatingOrderId(null);
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { color: '#f59e0b', backgroundColor: '#fef3c7' };
      case 'Processing': return { color: '#3b82f6', backgroundColor: '#dbeafe' };
      case 'Shipped': return { color: '#8b5cf6', backgroundColor: '#ede9fe' };
      case 'Delivered': return { color: '#10b981', backgroundColor: '#d1fae5' };
      case 'Cancelled': return { color: '#ef4444', backgroundColor: '#fee2e2' };
      default: return { color: '#64748b', backgroundColor: '#f1f5f9' };
    }
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>{item.date}</Text>
          <Text style={styles.orderTotal}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
        </View>
        {canManageOrders && (
          <View style={styles.statusActions}>
            {ORDER_STATUSES.map((status) => {
              const active = item.status === status;
              const disabled = active || updatingOrderId === item.id;
              return (
                <TouchableOpacity
                  key={`${item.id}-${status}`}
                  style={[styles.statusButton, active && styles.statusButtonActive, status === 'Cancelled' && styles.cancelStatusButton]}
                  disabled={disabled}
                  onPress={() => handleUpdateStatus(item.id, status)}
                >
                  <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive, status === 'Cancelled' && styles.cancelStatusText]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {!canManageOrders && ['Pending', 'Processing'].includes(item.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            disabled={updatingOrderId === item.id}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0ea5e9"]} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
            <Text style={styles.subEmptyText}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  listContent: { padding: 20 },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14 },
  orderDate: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  orderTotal: { fontWeight: '800', fontSize: 16, color: '#0ea5e9' },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff'
  },
  statusButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9'
  },
  statusButtonText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  statusButtonTextActive: { color: '#ffffff' },
  cancelStatusButton: {
    borderColor: '#ef4444',
    backgroundColor: '#ffffff',
  },
  cancelStatusText: {
    color: '#ef4444',
  },
  cancelButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: { color: '#64748b', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  subEmptyText: { color: '#94a3b8', fontSize: 14, marginTop: 10 }
});

export default OrdersScreen;
