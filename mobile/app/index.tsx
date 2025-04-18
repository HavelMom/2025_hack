import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { router, Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // If authentication state is loaded and user is authenticated, redirect based on role
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'patient') {
        router.replace('/(patient)/');
      } else if (user.role === 'provider') {
        router.replace('/(provider)/');
      }
    } else if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, user]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // This will only be shown briefly before redirect happens
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});
