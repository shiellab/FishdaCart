import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Animated } from 'react-native';
import { getFishListings } from '../../services/firestoreService';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [popularFish, setPopularFish] = useState([]);
  const [failedImageIds, setFailedImageIds] = useState({});
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const fetchFish = async () => {
      const listings = await getFishListings();
      setPopularFish(listings);
    };
    fetchFish();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, riseAnim]);

  const firstName = useMemo(() => {
    const displayName = user?.displayName || user?.email || user?.role || 'Guest';
    return displayName.split('@')[0];
  }, [user]);

  const availableCount = useMemo(
    () => popularFish.filter((item) => Number(item.stock) > 0).length,
    [popularFish]
  );

  const averagePrice = useMemo(() => {
    if (!popularFish.length) return 0;
    const total = popularFish.reduce((sum, item) => sum + Number(item.price || 0), 0);
    return total / popularFish.length;
  }, [popularFish]);

  const renderFishItem = ({ item }) => {
    const imageUri = item.imageUrl || item.image;
    const hasImage = !!imageUri && !failedImageIds[item.id];

    return (
      <TouchableOpacity
        style={styles.fishCard}
        onPress={() => navigation.navigate('FishDetails', { fish: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrap}>
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="fish" size={40} color="#94a3b8" />
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category?.name || 'Fish'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.fishName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fishMeta} numberOfLines={1}>
            {item.size || 'Medium'} - {item.temperament || 'Peaceful'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.fishPrice}>${Number(item.price).toFixed(2)}</Text>
            <Icon name="chevron-forward" size={16} color="#0ea5e9" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: riseAnim }]
        }}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingText}>Hello, {firstName}</Text>

          </View>
          <View style={styles.avatarCircle}>
            <Icon name="person" size={24} color="#0ea5e9" />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <Text style={styles.heroEyebrow}>FRESH STOCK - VERIFIED CARE DATA</Text>
          <Text style={styles.heroTitle}>Healthy Fish, Happier Tanks</Text>
          <Text style={styles.heroText}>
            Premium fish picks, updated inventory, and practical care guidance in one place.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroPrimaryButton} onPress={() => navigation.navigate('Fish')}>
              <Text style={styles.heroPrimaryText}>Shop Fish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroGhostButton} onPress={() => navigation.navigate('Care Guides')}>
              <Text style={styles.heroGhostText}>Care Guides</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{popularFish.length}</Text>
            <Text style={styles.metricLabel}>Listed Species</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{availableCount}</Text>
            <Text style={styles.metricLabel}>In Stock</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>${averagePrice.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Avg Price</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Fish</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Fish')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {popularFish.length > 0 ? (
          <FlatList
            data={popularFish}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFishItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fishListContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={30} color="#94a3b8" />
            <Text style={styles.emptyStateText}>Loading beautiful fish...</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Aquatic Tip</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Icon name="water" size={28} color="#0ea5e9" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Water Testing</Text>
            <Text style={styles.tipText}>
              Test your aquarium water weekly for Ammonia, Nitrite, and Nitrate levels to keep your fish stress-free.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    marginBottom: 16,
  },
  greetingText: { fontSize: 13, color: '#475569', fontWeight: '700', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.6 },
  header: { fontSize: 31, fontWeight: '900', color: '#082f49', letterSpacing: -0.9, lineHeight: 37 },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93c5fd',
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#082f49',
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroGlowTop: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: -40,
    right: -45,
    backgroundColor: '#38bdf8',
    opacity: 0.28,
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -52,
    left: -24,
    backgroundColor: '#0ea5e9',
    opacity: 0.25,
  },
  heroEyebrow: { color: '#bae6fd', fontSize: 11, fontWeight: '800', letterSpacing: 0.9, marginBottom: 9 },
  heroTitle: { color: '#ffffff', fontSize: 27, fontWeight: '900', lineHeight: 31 },
  heroText: { color: '#dbeafe', fontSize: 14, marginTop: 10, lineHeight: 22, fontWeight: '500' },
  heroActions: { flexDirection: 'row', marginTop: 16 },
  heroPrimaryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  heroPrimaryText: { color: '#1e293b', fontWeight: '800', fontSize: 13 },
  heroGhostButton: {
    borderColor: '#7dd3fc',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroGhostText: { color: '#e0f2fe', fontWeight: '700', fontSize: 13 },
  metricsRow: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 4,
  },
  metricValue: { color: '#0c4a6e', fontSize: 20, fontWeight: '900' },
  metricLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#082f49', letterSpacing: -0.4 },
  seeAllText: { fontSize: 15, fontWeight: '700', color: '#0284c7' },
  fishListContent: { paddingRight: 20 },
  fishCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginLeft: 20,
    width: 205,
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#0f172a',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative' },
  imagePlaceholder: {
    height: 130,
    backgroundColor: '#eef2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 130,
    width: '100%',
    backgroundColor: '#eef2f7',
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  cardContent: { padding: 12 },
  fishName: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  fishMeta: { marginTop: 2, color: '#64748b', fontSize: 12, fontWeight: '600' },
  cardFooter: { marginTop: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fishPrice: { fontSize: 18, fontWeight: '900', color: '#0284c7' },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyStateText: { marginTop: 10, color: '#94a3b8', fontSize: 14 },
  tipCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    shadowColor: '#0284c7',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  tipIconContainer: {
    backgroundColor: '#e0f2fe',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 5 },
  tipText: { color: '#64748b', lineHeight: 23, fontSize: 15, fontWeight: '500' },
  bottomSpace: { height: 40 },
});

export default HomeScreen;
