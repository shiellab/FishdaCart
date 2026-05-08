import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';

const CareGuidesScreen = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    { id: '1', title: 'Betta Basics', category: 'Betta', excerpt: 'Learn how to keep your Betta fish healthy and vibrant.' },
    { id: '2', title: 'Goldfish Tank Setup', category: 'Goldfish', excerpt: 'Choosing the right tank size and filtration for fancy goldfish.' },
    { id: '3', title: 'The Nitrogen Cycle', category: 'General', excerpt: 'Understanding the most important part of aquarium keeping.' },
    { id: '4', title: 'Guppy Breeding Guide', category: 'Guppies', excerpt: 'A step-by-step guide to breeding and raising healthy fry.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Care Library</Text>
        <Text style={styles.subtitle}>Expert advice for your aquatic friends</Text>
      </View>

      <View style={styles.guidesContainer}>
        {guides.map((guide) => (
          <TouchableOpacity key={guide.id} style={styles.guideCard} onPress={() => setSelectedGuide(guide)} activeOpacity={0.85}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{guide.category}</Text>
            </View>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Text style={styles.guideExcerpt}>{guide.excerpt}</Text>
            <Text style={styles.readMore}>Read Guide {'>'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={!!selectedGuide} transparent animationType="fade" onRequestClose={() => setSelectedGuide(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedGuide?.title}</Text>
            <Text style={styles.modalCategory}>{selectedGuide?.category}</Text>
            <Text style={styles.modalBody}>
              {selectedGuide?.excerpt} Follow this guide consistently and monitor your fish daily for behavior and appetite changes.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedGuide(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 25, backgroundColor: '#007bff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#e3f2fd', marginTop: 5 },
  guidesContainer: { padding: 20 },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  catText: { fontSize: 10, fontWeight: 'bold', color: '#007bff', textTransform: 'uppercase' },
  guideTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  guideExcerpt: { color: '#666', marginTop: 8, lineHeight: 20 },
  readMore: { marginTop: 15, color: '#007bff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  modalCategory: { marginTop: 4, color: '#0ea5e9', fontWeight: '700' },
  modalBody: { marginTop: 14, color: '#475569', lineHeight: 22, fontSize: 15 },
  closeButton: {
    marginTop: 18,
    alignSelf: 'flex-end',
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  closeButtonText: { color: '#ffffff', fontWeight: '700' },
});

export default CareGuidesScreen;