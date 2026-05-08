import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Image } from 'react-native';
import { useCart } from '../../context/CartContext';

const CartScreen = ({ navigation }) => {
  const { cart, addToCart, removeFromCart, totalAmount } = useCart();

  const renderCartItem = ({ item }) => (
    <View style={styles.itemCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} x {item.quantity}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => removeFromCart(item.id)}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.circleBtn} onPress={() => addToCart(item)}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
            <Button title="Start Shopping" onPress={() => navigation.navigate('Fish')} />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { padding: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 20 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imagePlaceholder: { width: 60, height: 60, backgroundColor: '#e0e0e0', borderRadius: 8 },
  image: { width: 60, height: 60, backgroundColor: '#e0e0e0', borderRadius: 8 },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#007bff', fontSize: 18, fontWeight: 'bold' },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: 'bold' },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  checkoutBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CartScreen;
