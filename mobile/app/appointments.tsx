import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Title, FAB, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/appointments/patient/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.secondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Title style={styles.title}>Upcoming Appointments</Title>
          {appointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No appointments scheduled</Text>
                <Button 
                  mode="contained" 
                  style={styles.scheduleButton}
                  onPress={() => router.push('/(patient)/schedule-appointment')}
                >
                  Schedule New Appointment
                </Button>
              </Card.Content>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment._id} style={styles.card}>
                <Card.Content>
                  <View style={styles.appointmentHeader}>
                    <Title>{appointment.type} Appointment</Title>
                    <Chip 
                      mode="outlined" 
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                      textStyle={{ color: '#fff' }}
                    >
                      {appointment.status}
                    </Chip>
                  </View>
                  <Text style={styles.dateText}>{formatDate(appointment.dateTime)}</Text>
                  <Text style={styles.providerText}>
                    Provider: Dr. {appointment.providerId?.userId?.fullName || 'Unknown'}
                  </Text>
                  {appointment.reason && (
                    <Text style={styles.reasonText}>Reason: {appointment.reason}</Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/(patient)/schedule-appointment')}
        label="New Appointment"
      />

      <Button
        mode="outlined"
        onPress={() => router.replace(user?.role === 'provider' ? '/(provider)/' : '/(patient)/')}
        style={{ margin: 16 }}
      >
        Back to Home
      </Button>
    </View>
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
  emptyText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  scheduleButton: { marginTop: 10 },
  appointmentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  dateText: { fontSize: 16, marginBottom: 8 },
  providerText: { fontSize: 16, marginBottom: 8 },
  reasonText: { fontSize: 14, color: '#666' },
  fab: {
    position: 'absolute', margin: 16, right: 0, bottom: 80,
  },
});
