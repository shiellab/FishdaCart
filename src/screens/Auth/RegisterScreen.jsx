import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter all fields.');
      return;
    }
    
    try {
      await register(email, password, role);
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={28} color="#0ea5e9" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the premier aquatic marketplace</Text>
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleCard, role === 'Customer' && styles.roleCardActive]} 
          onPress={() => setRole('Customer')}
        >
          <Icon name="person" size={24} color={role === 'Customer' ? '#ffffff' : '#64748b'} />
          <Text style={[styles.roleText, role === 'Customer' && styles.roleTextActive]}>Customer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.roleCard, role === 'Breeder' && styles.roleCardActive]} 
          onPress={() => setRole('Breeder')}
        >
          <Icon name="storefront" size={24} color={role === 'Breeder' ? '#ffffff' : '#64748b'} />
          <Text style={[styles.roleText, role === 'Breeder' && styles.roleTextActive]}>Breeder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, paddingTop: 60 },
  backButton: { marginBottom: 30, width: 40 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  formContainer: { width: '100%', marginTop: 10 },
  input: {
    backgroundColor: '#ffffff',
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  roleCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 80,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  roleCardActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  roleText: { fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 5 },
  roleTextActive: { color: '#ffffff' },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});

export default RegisterScreen;

