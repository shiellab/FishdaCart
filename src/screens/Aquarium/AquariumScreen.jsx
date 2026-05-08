import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Modal, TextInput } from 'react-native';

const AquariumScreen = () => {
  const [pets, setPets] = useState([
    { id: '1', name: 'Zippy', species: 'Halfmoon Betta', addedDays: 30 },
    { id: '2', name: 'Bubbles', species: 'Oranda Goldfish', addedDays: 15 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('');

  const addPet = () => {
    if (newName && newSpecies) {
      setPets([...pets, { id: Date.now().toString(), name: newName, species: newSpecies, addedDays: 0 }]);
      setNewName('');
      setNewSpecies('');
      setModalVisible(false);
    }
  };

  const renderPetItem = ({ item }) => (
    <View style={styles.petCard}>
      <View style={styles.petAvatar} />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petSpecies}>{item.species}</Text>
        <Text style={styles.petDays}>In aquarium for {item.addedDays} days</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Aquarium</Text>
        <Button title="+ Add Pet" onPress={() => setModalVisible(true)} />
      </View>

      <View style={styles.paramContainer}>
        <Text style={styles.paramTitle}>Water Quality</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>pH</Text>
            <Text style={styles.statValue}>7.2</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Temp</Text>
            <Text style={styles.statValue}>26°C</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Nitrate</Text>
            <Text style={[styles.statValue, { color: '#4caf50' }]}>Low</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Fish Pets</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderPetItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Pet</Text>
            <TextInput style={styles.modalInput} placeholder="Pet Name (e.g. Nemo)" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.modalInput} placeholder="Species (e.g. Clownfish)" value={newSpecies} onChangeText={setNewSpecies} />
            <View style={styles.modalButtons}>
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={addPet} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  paramContainer: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12, elevation: 2 },
  paramTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#666' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#999', fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 10, marginBottom: 10 },
  listContent: { paddingHorizontal: 20 },
  petCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  petAvatar: { width: 50, height: 50, backgroundColor: '#e3f2fd', borderRadius: 25 },
  petInfo: { marginLeft: 15 },
  petName: { fontSize: 18, fontWeight: 'bold' },
  petSpecies: { color: '#666' },
  petDays: { fontSize: 12, color: '#999', marginTop: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' }
});

export default AquariumScreen;
