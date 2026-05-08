import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error?.message || 'Unable to sign in with Google right now.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Icon name="water" size={64} color="#0ea5e9" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>FishdaCart</Text>
        <Text style={styles.subtitle}>Sign in to continue your aquatic journey</Text>
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
        <View style={styles.passwordWrap}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((prev) => !prev)}>
            <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Icon name="logo-google" size={20} color="#db4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextHighlight}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  formContainer: { width: '100%' },
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
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  passwordWrap: {
    backgroundColor: '#ffffff',
    height: 55,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    paddingLeft: 18,
    paddingRight: 8,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  googleButton: {
    backgroundColor: '#ffffff',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  googleButtonText: { color: '#334155', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  linkButton: { marginTop: 30, alignItems: 'center' },
  linkText: { color: '#64748b', fontSize: 15 },
  linkTextHighlight: { color: '#0ea5e9', fontWeight: 'bold' }
});

export default LoginScreen;
