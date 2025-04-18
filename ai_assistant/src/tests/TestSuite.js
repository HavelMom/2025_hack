import 'react-native-get-random-values';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// Create a TestSuite component for testing the application
export default function TestSuite() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Suite</Text>
      <Text style={styles.description}>
        This component will test all the functionality of the healthcare voice agent.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});
