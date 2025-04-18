import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  SafeAreaView,
  FlatList,
  Modal
} from 'react-native';
import ConsentFormExplainer from './ConsentFormExplainer';

/**
 * ProviderPortal component handles the healthcare provider interface
 * for the healthcare voice agent application.
 */
export default function ProviderPortal({ navigation, route }) {
  // State variables
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showSendConsentForm, setShowSendConsentForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample provider data (would come from your backend)
  const providerData = {
    id: 'DR12345',
    name: 'Dr. Sarah Johnson',
    specialty: 'Primary Care',
    patients: [
      { 
        id: 'P12345', 
        name: 'Alex Johnson', 
        age: 35, 
        gender: 'Male',
        lastVisit: 'March 15, 2025',
        upcomingAppointment: 'April 25, 2025 at 10:00 AM',
        conditions: ['Seasonal Allergies', 'Hypertension'],
        medications: ['Loratadine 10mg', 'Lisinopril 10mg'],
        notes: 'Patient has been managing allergies well with current medication.'
      },
      { 
        id: 'P23456', 
        name: 'Emily Rodriguez', 
        age: 42, 
        gender: 'Female',
        lastVisit: 'April 5, 2025',
        upcomingAppointment: 'None',
        conditions: ['Type 2 Diabetes', 'Osteoarthritis'],
        medications: ['Metformin 500mg', 'Acetaminophen 500mg'],
        notes: 'Blood sugar levels have improved with diet changes and medication.'
      },
      { 
        id: 'P34567', 
        name: 'Michael Chen', 
        age: 28, 
        gender: 'Male',
        lastVisit: 'February 20, 2025',
        upcomingAppointment: 'May 5, 2025 at 2:00 PM',
        conditions: ['Asthma'],
        medications: ['Albuterol inhaler'],
        notes: 'Asthma well-controlled with current treatment plan.'
      }
    ],
    appointments: [
      { id: 1, patientName: 'Alex Johnson', date: 'April 25, 2025', time: '10:00 AM', reason: 'Annual Physical' },
      { id: 2, patientName: 'Michael Chen', date: 'May 5, 2025', time: '2:00 PM', reason: 'Asthma Follow-up' },
      { id: 3, patientName: 'Sarah Williams', date: 'May 7, 2025', time: '11:30 AM', reason: 'New Patient Consultation' }
    ],
    messages: [
      { id: 1, from: 'Alex Johnson', date: 'April 16, 2025', content: 'Should I continue taking my allergy medication if symptoms have improved?', read: false },
      { id: 2, from: 'Emily Rodriguez', date: 'April 14, 2025', content: 'My blood sugar readings have been consistently under 120 for the past week.', read: true }
    ]
  };
  
  // Filter patients based on search query
  const filteredPatients = providerData.patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle sending a message to a patient
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedPatient) return;
    
    console.log('Message sent to', selectedPatient.name, ':', messageText);
    // In a real app, this would send the message to the patient
    setMessageText('');
  };
  
  // Handle sending a consent form to a patient
  const handleSendConsentForm = () => {
    if (!selectedPatient) return;
    
    console.log('Consent form sent to', selectedPatient.name);
    // In a real app, this would send the consent form to the patient
    setShowSendConsentForm(false);
  };
  
  // Render patients tab
  const renderPatientsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredPatients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.patientCard}
            onPress={() => {
              setSelectedPatient(item);
              setShowPatientDetails(true);
            }}
          >
            <View style={styles.patientHeader}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text style={styles.patientAge}>{item.age}, {item.gender}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientInfoLabel}>Last Visit:</Text>
              <Text style={styles.patientInfoValue}>{item.lastVisit}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientInfoLabel}>Upcoming:</Text>
              <Text style={styles.patientInfoValue}>
                {item.upcomingAppointment !== 'None' ? item.upcomingAppointment : 'No upcoming appointments'}
              </Text>
            </View>
            <View style={styles.patientConditions}>
              {item.conditions.map((condition, index) => (
                <View key={index} style={styles.conditionTag}>
                  <Text style={styles.conditionText}>{condition}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyStateText}>No patients found</Text>
        }
      />
    </View>
  );
  
  // Render appointments tab
  const renderAppointmentsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
      </View>
      
      {providerData.appointments.map(appointment => (
        <View key={appointment.id} style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentDate}>{appointment.date}</Text>
            <Text style={styles.appointmentTime}>{appointment.time}</Text>
          </View>
          <Text style={styles.appointmentPatient}>{appointment.patientName}</Text>
          <Text style={styles.appointmentReason}>{appointment.reason}</Text>
          <View style={styles.appointmentActions}>
            <TouchableOpacity style={styles.appointmentAction}>
              <Text style={styles.appointmentActionText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appointmentAction}>
              <Text style={styles.appointmentActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appointmentAction}>
              <Text style={styles.appointmentActionText}>Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
  
  // Render messages tab
  const renderMessagesTab = () => (
    <View style={styles.tabContent}>
      <ScrollView style={styles.messagesContainer}>
        {providerData.messages.map(message => (
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
            <View style={styles.messageActions}>
              <TouchableOpacity style={styles.messageAction}>
                <Text style={styles.messageActionText}>Reply</Text>
              </TouchableOpacity>
              {!message.read && (
                <TouchableOpacity style={styles.messageAction}>
                  <Text style={styles.messageActionText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
  
  // Render patient details modal
  const renderPatientDetailsModal = () => (
    <Modal
      visible={showPatientDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPatientDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Patient Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPatientDetails(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPatient && (
            <ScrollView style={styles.patientDetailsContainer}>
              <View style={styles.patientDetailsSection}>
                <Text style={styles.patientDetailsName}>{selectedPatient.name}</Text>
                <Text style={styles.patientDetailsInfo}>
                  {selectedPatient.age} years old, {selectedPatient.gender}
                </Text>
              </View>
              
              <View style={styles.patientDetailsSection}>
                <Text style={styles.patientDetailsSectionTitle}>Medical Conditions</Text>
                {selectedPatient.conditions.map((condition, index) => (
                  <Text key={index} style={styles.patientDetailsItem}>• {condition}</Text>
                ))}
              </View>
              
              <View style={styles.patientDetailsSection}>
                <Text style={styles.patientDetailsSectionTitle}>Current Medications</Text>
                {selectedPatient.medications.map((medication, index) => (
                  <Text key={index} style={styles.patientDetailsItem}>• {medication}</Text>
                ))}
              </View>
              
              <View style={styles.patientDetailsSection}>
                <Text style={styles.patientDetailsSectionTitle}>Notes</Text>
                <Text style={styles.patientDetailsNotes}>{selectedPatient.notes}</Text>
              </View>
              
              <View style={styles.patientDetailsSection}>
                <Text style={styles.patientDetailsSectionTitle}>Appointments</Text>
                <Text style={styles.patientDetailsItem}>
                  <Text style={styles.patientDetailsLabel}>Last Visit: </Text>
                  {selectedPatient.lastVisit}
                </Text>
                <Text style={styles.patientDetailsItem}>
                  <Text style={styles.patientDetailsLabel}>Upcoming: </Text>
                  {selectedPatient.upcomingAppointment !== 'None' 
                    ? selectedPatient.upcomingAppointment 
                    : 'No upcoming appointments'}
                </Text>
              </View>
              
              <View style={styles.patientActionsContainer}>
                <TouchableOpacity 
                  style={styles.patientAction}
                  onPress={() => {
                    setShowPatientDetails(false);
                    setShowSendConsentForm(true);
                  }}
                >
                  <Text style={styles.patientActionText}>Send Consent Form</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.patientAction}>
                  <Text style={styles.patientActionText}>Update Records</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Send a message to patient..."
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
  
  // Render send consent form modal
  const renderSendConsentFormModal = () => (
    <Modal
      visible={showSendConsentForm}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSendConsentForm(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Consent Form</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSendConsentForm(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPatient && (
            <View style={styles.consentFormContainer}>
              <Text style={styles.consentFormTitle}>
                Select a consent form to send to {selectedPatient.name}:
              </Text>
              
              <TouchableOpacity 
                style={styles.consentFormOption}
                onPress={handleSendConsentForm}
              >
                <Text style={styles.consentFormOptionTitle}>General Consent for Treatment</Text>
                <Text style={styles.consentFormOptionDescription}>
                  Standard consent for medical treatment and procedures
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.consentFormOption}
                onPress={handleSendConsentForm}
              >
                <Text style={styles.consentFormOptionTitle}>HIPAA Privacy Authorization</Text>
                <Text style={styles.consentFormOptionDescription}>
                  Authorization for release of protected health information
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.consentFormOption}
                onPress={handleSendConsentForm}
              >
                <Text style={styles.consentFormOptionTitle}>Procedure-Specific Consent</Text>
                <Text style={styles.consentFormOptionDescription}>
                  Detailed consent for specific medical procedures
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.consentFormOption}
                onPress={handleSendConsentForm}
              >
                <Text style={styles.consentFormOptionTitle}>Telehealth Consent</Text>
                <Text style={styles.consentFormOptionDescription}>
                  Consent for virtual healthcare services
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sendAllButton}
                onPress={handleSendConsentForm}
              >
                <Text style={styles.sendAllButtonText}>Send All Forms</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Portal</Text>
        <Text style={styles.headerSubtitle}>{providerData.name} - {providerData.specialty}</Text>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'patients' && renderPatientsTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'messages' && renderMessagesTab()}
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'patients' && styles.activeTabButton]} 
          onPress={() => setActiveTab('patients')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Patients</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'appointments' && styles.activeTabButton]} 
          onPress={() => setActiveTab('appointments')}
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={styles.tabLabel}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'messages' && styles.activeTabButton]} 
          onPress={() => setActiveTab('messages')}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={styles.tabLabel}>Messages</Text>
        </TouchableOpacity>
      </View>
      
      {renderPatientDetailsModal()}
      {renderSendConsentFormModal()}
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
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
  },
  patientInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  patientInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 80,
  },
  patientInfoValue: {
    fontSize: 14,
    flex: 1,
  },
  patientConditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  conditionTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 12,
    color: '#1976d2',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  appointmentPatient: {
    fontSize: 16,
    marginBottom: 5,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  appointmentAction: {
    marginLeft: 15,
  },
  appointmentActionText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  messagesContainer: {
    padding: 10,
  },
  messageCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
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
    marginBottom: 10,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  messageAction: {
    marginLeft: 15,
  },
  messageActionText: {
    color: '#4a90e2',
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4a90e2',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientDetailsContainer: {
    padding: 15,
  },
  patientDetailsSection: {
    marginBottom: 20,
  },
  patientDetailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patientDetailsInfo: {
    fontSize: 16,
    color: '#666',
  },
  patientDetailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  patientDetailsItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  patientDetailsLabel: {
    fontWeight: 'bold',
  },
  patientDetailsNotes: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  patientActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  patientAction: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  patientActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
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
  consentFormContainer: {
    padding: 15,
  },
  consentFormTitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  consentFormOption: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  consentFormOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  consentFormOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  sendAllButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  sendAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
