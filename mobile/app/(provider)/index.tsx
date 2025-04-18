import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Title } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function ProviderHomeScreen() {
  const { setIsAuthenticated, setUser } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setIsAuthenticated(false);
            setUser(null);
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Title>Welcome, Provider</Title>
      <Text style={styles.subtitle}>
        Manage your patients and appointments
      </Text>

      <View style={styles.buttonGroup}>
        <Button mode="contained" onPress={() => router.push('/appointments')} style={styles.button}>
          View Appointments
        </Button>
        <Button mode="contained" onPress={() => router.push('/medical-records')} style={styles.button}>
          Medical Records
        </Button>
        <Button mode="contained" onPress={() => router.push('/messages')} style={styles.button}>
          Messages
        </Button>
        <Button mode="contained" onPress={() => router.push('/ai-assistant')} style={styles.button}>
          AI Assistant
        </Button>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.button, { marginTop: 20 }]}
          textColor="#d32f2f"
        >
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 30,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 6,
  },
});
