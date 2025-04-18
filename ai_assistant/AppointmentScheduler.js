import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

/**
 * AppointmentScheduler component handles the appointment scheduling functionality
 * for the healthcare voice agent application.
 */
export default function AppointmentScheduler({
  visible,
  onClose,
  onSchedule,
  patientName = '',
  reason = '',
  providerInfo = null
}) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState(
    providerInfo ? providerInfo.name : ''
  );
  const [appointmentReason, setAppointmentReason] = useState(reason || '');
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Sample available dates (would come from provider's API)
  const availableDates = [
    { id: 1, date: 'Monday, April 20, 2025' },
    { id: 2, date: 'Tuesday, April 21, 2025' },
    { id: 3, date: 'Wednesday, April 22, 2025' },
    { id: 4, date: 'Thursday, April 23, 2025' },
    { id: 5, date: 'Friday, April 24, 2025' },
  ];

  // Sample available time slots (would come from provider's API)
  const availableTimes = [
    { id: 1, time: '9:00 AM' },
    { id: 2, time: '10:00 AM' },
    { id: 3, time: '11:00 AM' },
    { id: 4, time: '1:00 PM' },
    { id: 5, time: '2:00 PM' },
    { id: 6, time: '3:00 PM' },
  ];

  // Sample healthcare providers (would come from your backend)
  const providers = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Primary Care' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Family Medicine' },
  ];

  // Handle appointment scheduling
  const handleScheduleAppointment = () => {
    setProcessing(true);
    
    // Simulate API call to schedule appointment
    setTimeout(() => {
      const appointmentDetails = {
        provider: preferredProvider,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentReason,
        patientName: patientName,
        confirmationCode: 'APT' + Math.floor(100000 + Math.random() * 900000)
      };
      
      setConfirmation(appointmentDetails);
      setProcessing(false);
      setStep(4); // Move to confirmation step
      
      // Notify parent component
      if (onSchedule) {
        onSchedule(appointmentDetails);
      }
    }, 2000);
  };

  // Reset and close the modal
  const handleClose = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmation(null);
    onClose();
  };

  // Render date selection step
  const renderDateSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Date</Text>
      <ScrollView style={styles.optionsContainer}>
        {availableDates.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.optionItem,
              selectedDate === item.date && styles.selectedOption
            ]}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text style={[
              styles.optionText,
              selectedDate === item.date && styles.selectedOptionText
            ]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, !selectedDate && styles.disabledButton]}
          disabled={!selectedDate}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render time selection step
  const renderTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Time</Text>
      <Text style={styles.stepSubtitle}>{selectedDate}</Text>
      <ScrollView style={styles.optionsContainer}>
        {availableTimes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.optionItem,
              selectedTime === item.time && styles.selectedOption
            ]}
            onPress={() => setSelectedTime(item.time)}
          >
            <Text style={[
              styles.optionText,
              selectedTime === item.time && styles.selectedOptionText
            ]}>
              {item.time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !selectedTime && styles.disabledButton]}
          disabled={!selectedTime}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render appointment details step
  const renderAppointmentDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Appointment Details</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Provider</Text>
        <TextInput
          style={styles.input}
          value={preferredProvider}
          onChangeText={setPreferredProvider}
          placeholder="Enter provider name"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Reason for Visit</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={appointmentReason}
          onChangeText={setAppointmentReason}
          placeholder="Describe the reason for your visit"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Appointment Summary</Text>
        <Text style={styles.summaryText}>Date: {selectedDate}</Text>
        <Text style={styles.summaryText}>Time: {selectedTime}</Text>
        <Text style={styles.summaryText}>Provider: {preferredProvider || 'Not specified'}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleScheduleAppointment}
        >
          <Text style={styles.buttonText}>Schedule Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render confirmation step
  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.confirmationTitle}>Appointment Confirmed!</Text>
      
      {confirmation && (
        <View style={styles.confirmationDetails}>
          <Text style={styles.confirmationText}>
            Your appointment has been scheduled with {confirmation.provider} on {confirmation.date} at {confirmation.time}.
          </Text>
          <Text style={styles.confirmationCode}>
            Confirmation Code: {confirmation.confirmationCode}
          </Text>
          <Text style={styles.confirmationInstructions}>
            Please arrive 15 minutes before your appointment time. You will receive a reminder 24 hours before your appointment.
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleClose}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4a90e2" />
      <Text style={styles.loadingText}>Scheduling your appointment...</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Schedule Appointment</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {processing ? renderLoading() : (
            <>
              {step === 1 && renderDateSelection()}
              {step === 2 && renderTimeSelection()}
              {step === 3 && renderAppointmentDetails()}
              {step === 4 && renderConfirmation()}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4a90e2',
  },
  headerTitle: {
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
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginVertical: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationDetails: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  confirmationCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  confirmationInstructions: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
