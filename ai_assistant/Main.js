import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';
import App from './App';
import PatientPortal from './PatientPortal';
import ProviderPortal from './ProviderPortal';
import TestSuite from './TestSuite';

/**
 * Main entry point for the healthcare voice agent application
 * This component provides navigation between different parts of the app
 */
function Main() {
  const [currentScreen, setCurrentScreen] = React.useState('home');
  const [userType, setUserType] = React.useState(null);

  // Render home screen
  const renderHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Healthcare Voice Agent</Text>
        <Text style={styles.subtitle}>AI-powered healthcare assistant</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select User Type</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.userTypeButton} 
            onPress={() => setUserType('patient')}
          >
            <Text style={styles.userTypeButtonText}>Patient</Text>
            <Text style={styles.userTypeDescription}>
              Access your health records, schedule appointments, and communicate with providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.userTypeButton} 
            onPress={() => setUserType('provider')}
          >
            <Text style={styles.userTypeButtonText}>Healthcare Provider</Text>
            <Text style={styles.userTypeDescription}>
              Manage patients, appointments, and send consent forms
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={styles.featureTitle}>Voice Interface</Text>
            <Text style={styles.featureDescription}>
              Describe symptoms verbally and receive AI-powered diagnosis suggestions
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Appointment Scheduling</Text>
            <Text style={styles.featureDescription}>
              Schedule appointments with healthcare providers through voice or app interface
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>Consent Form Explanation</Text>
            <Text style={styles.featureDescription}>
              Get plain-language explanations of medical consent forms
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>Provider Communication</Text>
            <Text style={styles.featureDescription}>
              Direct messaging with healthcare providers
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => setCurrentScreen('voiceAssistant')}
        >
          <Text style={styles.navigationButtonText}>Voice Assistant</Text>
        </TouchableOpacity>

        {userType === 'patient' && (
          <TouchableOpacity 
            style={styles.navigationButton}
            onPress={() => setCurrentScreen('patientPortal')}
          >
            <Text style={styles.navigationButtonText}>Patient Portal</Text>
          </TouchableOpacity>
        )}

        {userType === 'provider' && (
          <TouchableOpacity 
            style={styles.navigationButton}
            onPress={() => setCurrentScreen('providerPortal')}
          >
            <Text style={styles.navigationButtonText}>Provider Portal</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => setCurrentScreen('testSuite')}
        >
          <Text style={styles.navigationButtonText}>Test Suite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Version {Constants.expoConfig?.version || '1.0.0'}
        </Text>
        <Text style={styles.footerText}>
          Powered by LiveKit
        </Text>
      </View>
    </ScrollView>
  );

  // Render current screen based on state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHome();
      case 'voiceAssistant':
        return (
          <View style={styles.screenContainer}>
            <App />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      case 'patientPortal':
        return (
          <View style={styles.screenContainer}>
            <PatientPortal />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      case 'providerPortal':
        return (
          <View style={styles.screenContainer}>
            <ProviderPortal />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      case 'testSuite':
        return (
          <View style={styles.screenContainer}>
            <TestSuite />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return renderHome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderCurrentScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  userTypeButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userTypeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4a90e2',
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
  navigationContainer: {
    marginBottom: 30,
  },
  navigationButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  screenContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 100,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Register the main component as the root component
registerRootComponent(Main);

export default Main;
