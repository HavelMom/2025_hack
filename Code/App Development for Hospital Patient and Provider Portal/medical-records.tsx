import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Title, ActivityIndicator, useTheme, List } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientMedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const theme = useTheme();

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medical-records/patient/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedicalRecords();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Title style={styles.title}>My Medical Records</Title>
          
          {medicalRecords.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No medical records found</Text>
              </Card.Content>
            </Card>
          ) : (
            medicalRecords.map((record) => (
              <Card key={record._id} style={styles.card}>
                <Card.Content>
                  <Title>{record.diagnosis}</Title>
                  <Text style={styles.dateText}>
                    Date: {formatDate(record.recordDate)}
                  </Text>
                  <Text style={styles.providerText}>
                    Provider: Dr. {record.providerId?.userId?.fullName || 'Unknown'}
                  </Text>
                  
                  <List.Accordion
                    title="Symptoms"
                    left={props => <List.Icon {...props} icon="medical-bag" />}
                  >
                    <List.Item 
                      title={record.symptoms || 'No symptoms recorded'}
                      titleNumberOfLines={10}
                    />
                  </List.Accordion>
                  
                  <List.Accordion
                    title="Treatment"
                    left={props => <List.Icon {...props} icon="pill" />}
                  >
                    <List.Item 
                      title={record.treatment || 'No treatment recorded'}
                      titleNumberOfLines={10}
                    />
                  </List.Accordion>
                  
                  {record.notes && (
                    <List.Accordion
                      title="Notes"
                      left={props => <List.Icon {...props} icon="note-text" />}
                    >
                      <List.Item 
                        title={record.notes}
                        titleNumberOfLines={10}
                      />
                    </List.Accordion>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => router.push(`/(patient)/medical-record-details/${record._id}`)}>
                    View Full Details
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    margin: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 8,
  },
  providerText: {
    fontSize: 16,
    marginBottom: 16,
  },
});
