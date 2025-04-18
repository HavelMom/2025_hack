import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, Title, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/prescriptions/patient/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      //Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      case 'EXPIRED':
        return '#888888';
      default:
        return theme.colors.secondary;
    }
  };

  const requestRefill = async (prescriptionId) => {
    try {
      Alert.alert('Refill Requested', 'Your refill request has been sent to your provider.');
    } catch (error) {
      console.error('Error requesting refill:', error);
      Alert.alert('Error', 'Failed to request refill');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{
              paddingTop: insets.top + 16,
              paddingBottom: 120,
            }}
          >
            <Title style={styles.title}>My Prescriptions</Title>

            {prescriptions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No prescriptions found</Text>
                </Card.Content>
              </Card>
            ) : (
              prescriptions.map((prescription) => (
                <Card key={prescription._id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.headerContainer}>
                      <Title>{prescription.medicationName}</Title>
                      <Chip
                        mode="outlined"
                        style={{ backgroundColor: getStatusColor(prescription.status) }}
                        textStyle={{ color: '#fff' }}
                      >
                        {prescription.status}
                      </Chip>
                    </View>

                    <Text style={styles.dosageText}>
                      {prescription.dosage}, {prescription.frequency}
                    </Text>

                    <Text style={styles.dateText}>
                      Start: {formatDate(prescription.startDate)}
                    </Text>

                    <Text style={styles.dateText}>
                      End: {formatDate(prescription.endDate)}
                    </Text>

                    <Text style={styles.providerText}>
                      Prescribed by: Dr. {prescription.providerId?.userId?.fullName || 'Unknown'}
                    </Text>

                    {prescription.refills > 0 && (
                      <Text style={styles.refillsText}>
                        Refills remaining: {prescription.refills}
                      </Text>
                    )}

                    {prescription.notes && (
                      <Text style={styles.notesText}>
                        Notes: {prescription.notes}
                      </Text>
                    )}
                  </Card.Content>
                  <Card.Actions>
                    {prescription.status === 'ACTIVE' && prescription.refills > 0 && (
                      <Button
                        mode="contained"
                        onPress={() => requestRefill(prescription._id)}
                      >
                        Request Refill
                      </Button>
                    )}
                  </Card.Actions>
                </Card>
              ))
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
            <Button
              mode="outlined"
              onPress={() => router.replace(user?.role === 'provider' ? '/(provider)/' : '/(patient)/')}
            >
              Back to Home
            </Button>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  scrollView: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', margin: 16 },
  card: { marginHorizontal: 16, marginBottom: 16, elevation: 2 },
  emptyCard: { marginHorizontal: 16, marginBottom: 16, padding: 10, alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dosageText: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  dateText: { fontSize: 16, marginBottom: 4 },
  providerText: { fontSize: 16, marginTop: 10, marginBottom: 4 },
  refillsText: { fontSize: 16, marginTop: 10, fontWeight: 'bold' },
  notesText: { fontSize: 14, marginTop: 10, color: '#666', fontStyle: 'italic' },
});