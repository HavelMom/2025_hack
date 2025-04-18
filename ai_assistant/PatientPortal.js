import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  TextInput,
  SafeAreaView
} from 'react-native';
import AppointmentScheduler from './AppointmentScheduler';
import ConsentFormExplainer from './ConsentFormExplainer';

/**
 * PatientPortal component handles the patient-facing interface
 * for the healthcare voice agent application.
 */
export default function PatientPortal({ navigation, route }) {
  // State variables
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Sample patient data (would come from your backend)
  const patientData = {
    id: 'P12345',
    name: 'Alex Johnson',
    age: 35,
    gender: 'Male',
    primaryProvider: 'Dr. Sarah Johnson',
    upcomingAppointments: [
      { id: 1, date: 'April 25, 2025', time: '10:00 AM', provider: 'Dr. Sarah Johnson', reason: 'Annual Physical' }
    ],
    recentDiagnoses: [
      { id: 1, date: 'March 15, 2025', condition: 'Seasonal Allergies', provider: 'Dr. Michael Chen' }
    ],
    medications: [
      { id: 1, name: 'Loratadine', dosage: '10mg', frequency: 'Once daily', refillDate: 'May 10, 2025' }
    ],
    messages: [
      { id: 1, from: 'Dr. Sarah Johnson', date: 'April 15, 2025', content: 'Your lab results look good. Continue with your current medications.', read: true },
      { id: 2, from: 'Nurse Practitioner', date: 'April 10, 2025', content: 'Please remember to complete your health questionnaire before your upcoming appointment.', read: false }
    ],
    pendingForms: [
      { id: 1, title: 'General Consent for Treatment', dueDate: 'April 24, 2025' }
    ]
  };
  
  // Handle appointment scheduling
  const handleAppointmentScheduled = (appointmentDetails) => {
    console.log('Appointment scheduled:', appointmentDetails);
    // In a real app, this would update the patient's appointments in the backend
  };
  
  // Handle consent form completion
  const handleConsentFormCompleted = (formDetails) => {
    console.log('Consent form completed:', formDetails);
    // In a real app, this would update the patient's completed forms in the backend
  };
  
  // Handle message sending
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    
    console.log('Message sent:', messageText);
    // In a real app, this would send the message to the provider
    setMessageText('');
  };
  
  // Render dashboard tab
  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back, {patientData.name}</Text>
        <Text style={styles.dateText}>Today is {new Date().toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowAppointmentScheduler(true)}
          >
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>Schedule Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionText}>Message Provider</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setActiveTab('records')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>View Records</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {patientData.upcomingAppointments.length > 0 ? (
          patientData.upcomingAppointments.map(appointment => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentDate}>{appointment.date}</Text>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
              </View>
              <Text style={styles.appointmentProvider}>{appointment.provider}</Text>
              <Text style={styles.appointmentReason}>{appointment.reason}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No upcoming appointments</Text>
        )}
      </View>
      
      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>Pending Forms</Text>
        {patientData.pendingForms.length > 0 ? (
          patientData.pendingForms.map(form => (
            <TouchableOpacity 
              key={form.id} 
              style={styles.formCard}
              onPress={() => setShowConsentForm(true)}
            >
              <Text style={styles.formTitle}>{form.title}</Text>
              <Text style={styles.formDueDate}>Due: {form.dueDate}</Text>
              <Text style={styles.formAction}>Tap to complete</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No pending forms</Text>
        )}
      </View>
    </ScrollView>
  );
  
  // Render records tab
  const renderRecords = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Medical Records</Text>
        
        <View style={styles.recordCard}>
          <Text style={styles.recordCardTitle}>Recent Diagnoses</Text>
          {patientData.recentDiagnoses.map(diagnosis => (
            <View key={diagnosis.id} style={styles.recordItem}>
              <Text style={styles.recordDate}>{diagnosis.date}</Text>
              <Text style={styles.recordPrimary}>{diagnosis.condition}</Text>
              <Text style={styles.recordSecondary}>{diagnosis.provider}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.recordCard}>
          <Text style={styles.recordCardTitle}>Current Medications</Text>
          {patientData.medications.map(medication => (
            <View key={medication.id} style={styles.recordItem}>
              <Text style={styles.recordPrimary}>{medication.name} {medication.dosage}</Text>
              <Text style={styles.recordSecondary}>Take {medication.frequency}</Text>
              <Text style={styles.recordDate}>Refill by: {medication.refillDate}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request Complete Records</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  // Render messages tab
  const renderMessages = () => (
    <View style={styles.tabContent}>
      <ScrollView style={styles.messagesContainer}>
        {patientData.messages.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageCard,
              !message.read && styles.unreadMessage
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageSender}>{message.from}</Text>
              <Text style={styles.messageDate}>{message.date}</Text>
            </View>
            <Text style={styles.messageContent}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message to your provider..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Portal</Text>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'records' && renderRecords()}
        {activeTab === 'messages' && renderMessages()}
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'dashboard' && styles.activeTabButton]} 
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'records' && styles.activeTabButton]} 
          onPress={() => setActiveTab('records')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Records</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'messages' && styles.activeTabButton]} 
          onPress={() => setActiveTab('messages')}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={styles.tabLabel}>Messages</Text>
        </TouchableOpacity>
      </View>
      
      <AppointmentScheduler
        visible={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        onSchedule={handleAppointmentScheduled}
        patientName={patientData.name}
      />
      
      <ConsentFormExplainer
        visible={showConsentForm}
        onClose={() => setShowConsentForm(false)}
        onComplete={handleConsentFormCompleted}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  upcomingSection: {
    marginBottom: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  appointmentDate: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  appointmentTime: {
    fontSize: 16,
    color: '#4a90e2',
  },
  appointmentProvider: {
    fontSize: 14,
    marginBottom: 5,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#666',
  },
  pendingSection: {
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  formTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  formDueDate: {
    fontSize: 14,
    color: '#e53935',
    marginBottom: 5,
  },
  formAction: {
    fontSize: 14,
    color: '#4a90e2',
    fontStyle: 'italic',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  recordsSection: {
    marginBottom: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  recordCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  recordItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  recordPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  recordSecondary: {
    fontSize: 14,
    color: '#666',
  },
  requestButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  unreadMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageSender: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeTabButton: {
    borderTopWidth: 2,
    borderTopColor: '#4a90e2',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 12,
  },
});
