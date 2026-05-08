import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { useCart } from '../../context/CartContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const FishDetailsScreen = ({ route, navigation }) => {
  const { addToCart } = useCart();
  const fish = route?.params?.fish;
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = useMemo(() => fish?.imageUrl || fish?.image || null, [fish]);

  if (!fish) {
    return (
      <View style={styles.centered}>
        <Text>No fish details available.</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(fish);
    Alert.alert(
      'Success', 
      `${fish.name} added to cart!`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imageUri && !imageFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.mainImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon name="fish" size={100} color="#94a3b8" />
          )}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{fish.name}</Text>
              <Text style={styles.categoryName}>{fish.category?.name || 'Aquarium Fish'}</Text>
            </View>
            <Text style={styles.price}>${Number(fish.price).toFixed(2)}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Icon name="resize" size={20} color="#0ea5e9" />
              <Text style={styles.statValue}>{fish.size || 'Medium'}</Text>
              <Text style={styles.statLabel}>Size</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="heart" size={20} color="#f43f5e" />
              <Text style={styles.statValue}>{fish.temperament || 'Peaceful'}</Text>
              <Text style={styles.statLabel}>Nature</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="cube" size={20} color="#10b981" />
              <Text style={styles.statValue}>{fish.stock || 0}</Text>
              <Text style={styles.statLabel}>Stock</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About this fish</Text>
          <Text style={styles.description}>
            {fish.description || 'This beautiful fish is a wonderful addition to any aquarium. It is known for its vibrant colors and engaging personality.'}
          </Text>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.buyButton, fish.stock <= 0 && styles.disabledButton]} 
          onPress={handleAddToCart}
          disabled={fish.stock <= 0}
        >
          <Icon name="cart" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.buyButtonText}>
            {fish.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { 
    width: '100%', 
    height: width * 0.8, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mainImage: {
    width: '100%',
    height: '100%'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    marginTop: -30,
    flex: 1,
    minHeight: 500
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  categoryName: { fontSize: 16, color: '#64748b', fontWeight: '600', marginTop: 4 },
  price: { fontSize: 24, fontWeight: '800', color: '#0ea5e9' },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 15
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  description: { fontSize: 16, color: '#64748b', lineHeight: 26, fontWeight: '500' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  buyButton: {
    backgroundColor: '#0ea5e9',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  buyButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  disabledButton: { backgroundColor: '#cbd5e1', shadowOpacity: 0 }
});

export default FishDetailsScreen;
