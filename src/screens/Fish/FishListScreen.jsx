import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { getFishListings } from '../../services/firestoreService';
import Icon from 'react-native-vector-icons/Ionicons';

const FishListScreen = ({ categoryId, navigation }) => {
  const [fishList, setFishList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFish = useCallback(async () => {
    try {
      const listings = await getFishListings(categoryId);
      setFishList(listings);
    } catch (error) {
      console.error("Error fetching fish:", error);
    }
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    fetchFish().finally(() => setLoading(false));
  }, [fetchFish]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFish().finally(() => setRefreshing(false));
  }, [fetchFish]);

  const renderFishItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('FishDetails', { fish: item })}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon name="fish" size={30} color="#94a3b8" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>{item.size || 'Medium'} - {item.temperament || 'Peaceful'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          {item.stock > 0 ? (
            <Text style={styles.stockText}>{item.stock} in stock</Text>
          ) : (
            <Text style={[styles.stockText, { color: '#ef4444' }]}>Out of stock</Text>
          )}
        </View>
      </View>
      <View style={styles.chevron}>
        <Icon name="chevron-forward" size={20} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );

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
        data={fishList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFishItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0ea5e9"]} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Icon name="search-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyText}>No fish found in this category.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  listContent: { padding: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center'
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f1f5f9'
  },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  detail: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontSize: 16, color: '#0ea5e9', fontWeight: '800' },
  stockText: { fontSize: 11, color: '#10b981', fontWeight: '700', textTransform: 'uppercase' },
  chevron: { paddingLeft: 10 },
  emptyText: { color: '#64748b', fontSize: 16, fontWeight: '600', marginTop: 15 }
});

export default FishListScreen;
