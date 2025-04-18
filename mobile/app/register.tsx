import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, RadioButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  
  // Profile specific fields
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [ssn, setSsn] = useState('');
  const [credentials, setCredentials] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !fullName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Role-specific validation
    if (role === 'patient' && (!insuranceNumber || !ssn)) {
      Alert.alert('Error', 'Please provide insurance number and SSN');
      return;
    }

    if (role === 'provider' && (!credentials || !specialization || !licenseNumber)) {
      Alert.alert('Error', 'Please provide credentials, specialization, and license number');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare profile data based on role
      let profileData = {};
      
      if (role === 'patient') {
        profileData = {
          insuranceNumber,
          ssn,
          dateOfBirth: new Date().toISOString() // This should be a date picker in a real app
        };
      } else {
        profileData = {
          credentials,
          specialization,
          licenseNumber
        };
      }
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        fullName,
        phoneNumber,
        role,
        profileData
      });

      // Store token and user info
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));

      // Redirect based on role
      if (response.data.user.role === 'patient') {
        router.replace('/(patient)/');
      } else if (response.data.user.role === 'provider') {
        router.replace('/(provider)/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An error occurred during registration'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Title style={styles.title}>Create Account</Title>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
          />

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
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            mode="outlined"
            keyboardType="phone-pad"
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

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Account Type</Text>
          <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
            <View style={styles.radioContainer}>
              <RadioButton value="patient" />
              <Text>Patient</Text>
            </View>
            <View style={styles.radioContainer}>
              <RadioButton value="provider" />
              <Text>Healthcare Provider</Text>
            </View>
          </RadioButton.Group>

          {/* Conditional fields based on role */}
          {role === 'patient' ? (
            <View style={styles.roleSpecificContainer}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <TextInput
                label="Insurance Number"
                value={insuranceNumber}
                onChangeText={setInsuranceNumber}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="SSN"
                value={ssn}
                onChangeText={setSsn}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.roleSpecificContainer}>
              <Text style={styles.sectionTitle}>Provider Information</Text>
              <TextInput
                label="Credentials"
                value={credentials}
                onChangeText={setCredentials}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                mode="outlined"
                style={styles.input}
              />
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Register
          </Button>

          <View style={styles.linkContainer}>
            <Text>Already have an account? </Text>
            <Text
              style={styles.link}
              onPress={() => router.push('/login')}
            >
              Login
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleSpecificContainer: {
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
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
});
