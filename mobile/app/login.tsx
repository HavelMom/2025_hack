import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Title, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { setUser, setIsAuthenticated } = useAuth();
  const insets = useSafeAreaInsets(); // ✅

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      router.replace(user.role === 'provider' ? '/(provider)/' : '/(patient)/');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'patient' | 'provider') => {
    const mockUser = {
      id: `demo-${role}`,
      email: `${role}@demo.com`,
      fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    router.replace(role === 'provider' ? '/(provider)/' : '/(patient)/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.headerContainer}>
          <Title style={styles.title}>Welcome Back</Title>
          <Text style={styles.subtitle}>Log in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Login
          </Button>

          <View style={styles.linkContainer}>
            <Text>Don't have an account? </Text>
            <Text style={styles.link} onPress={() => router.push('/register')}>Register</Text>
          </View>

          <Title style={styles.demoTitle}>Or try a demo:</Title>

          <Button
            mode="outlined"
            onPress={() => handleDemoLogin('patient')}
            style={styles.demoButton}
          >
            Demo as Patient
          </Button>

          <Button
            mode="outlined"
            onPress={() => handleDemoLogin('provider')}
            style={styles.demoButton}
          >
            Demo as Provider
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  formContainer: { width: '100%' },
  input: { marginBottom: 15 },
  button: { marginTop: 10, paddingVertical: 6 },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  link: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoButton: {
    marginBottom: 10,
  },
});
