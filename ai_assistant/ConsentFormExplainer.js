import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';

/**
 * ConsentFormExplainer component handles the explanation and management of consent forms
 * for the healthcare voice agent application.
 */
export default function ConsentFormExplainer({
  visible,
  onClose,
  onComplete,
  formData = null
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  // Sample consent form data (would come from healthcare provider's system)
  const consentForm = formData || {
    title: "General Consent for Treatment",
    sections: [
      {
        title: "Consent for Medical Treatment",
        content: "I voluntarily consent to medical treatment and diagnostic procedures provided by this healthcare facility and its associated physicians, clinicians, and other personnel. I consent to the testing for infectious diseases, such as, but not limited to COVID-19, syphilis, hepatitis, HIV/AIDS, and testing for drugs if deemed advisable by my physician. I am aware that the practice of medicine and surgery is not an exact science and I acknowledge that no guarantees have been made to me as to the result of treatments or examinations.",
        explanation: "This section asks for your permission to receive medical care from our healthcare providers. It also allows doctors to test for infectious diseases if needed for your diagnosis and treatment. It acknowledges that medicine isn't perfect and results can't be guaranteed."
      },
      {
        title: "Release of Medical Information",
        content: "I authorize the healthcare facility to release my medical information to insurance carriers, third party payers, or their representatives, as necessary for payment of claims related to my healthcare. This information may also be released to agencies for accreditation, registry, data collection, or quality improvement purposes. I understand that my medical information may be released as required by law or court order.",
        explanation: "This section allows the healthcare provider to share your medical information with your insurance company for billing purposes. It also permits sharing information for quality improvement and as required by law. Your medical information remains protected under privacy laws."
      },
      {
        title: "Financial Agreement",
        content: "I agree to pay for all services rendered by the healthcare facility and its physicians. I understand that payment is due at the time of service unless other arrangements have been made. I authorize direct payment from my insurance carrier to the healthcare facility. I understand that I am financially responsible for any services not covered by my insurance and for any co-payments, deductibles, or co-insurance.",
        explanation: "This section states that you agree to pay for your medical care, either directly or through your insurance. You're responsible for any costs your insurance doesn't cover, including co-pays and deductibles. It also allows your insurance to pay the healthcare provider directly."
      },
      {
        title: "Privacy Practices Acknowledgment",
        content: "I acknowledge that I have been offered or received a copy of the healthcare facility's Notice of Privacy Practices, which describes how my health information may be used and disclosed and how I can get access to this information.",
        explanation: "This confirms that you've been informed about how your health information may be used and your rights regarding your medical records. The Notice of Privacy Practices is a separate document that explains these rights in detail."
      }
    ]
  };

  // Handle section navigation
  const goToNextSection = () => {
    if (currentSection < consentForm.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setShowExplanation(false);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setShowExplanation(false);
    }
  };

  // Toggle explanation visibility
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  // Handle form completion
  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        formTitle: consentForm.title,
        agreed: agreed,
        timestamp: new Date().toISOString()
      });
    }
    onClose();
  };

  // Render current section
  const renderCurrentSection = () => {
    const section = consentForm.sections[currentSection];
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.contentText}>{section.content}</Text>
          
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Simple Explanation:</Text>
              <Text style={styles.explanationText}>{section.explanation}</Text>
            </View>
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.explanationButton} 
          onPress={toggleExplanation}
        >
          <Text style={styles.explanationButtonText}>
            {showExplanation ? "Hide Explanation" : "Explain in Simple Terms"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.navigationContainer}>
          {currentSection > 0 && (
            <TouchableOpacity 
              style={styles.navigationButton} 
              onPress={goToPreviousSection}
            >
              <Text style={styles.navigationButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentSection < consentForm.sections.length - 1 ? (
            <TouchableOpacity 
              style={styles.navigationButton} 
              onPress={goToNextSection}
            >
              <Text style={styles.navigationButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.agreementContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.agreementText}>
                  I have read and understand this consent form
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.completeButton, !agreed && styles.disabledButton]}
                disabled={!agreed}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Progress indicator
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        {consentForm.sections.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot,
              index === currentSection && styles.progressDotActive
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{consentForm.title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {renderProgressIndicator()}
          {renderCurrentSection()}
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
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    margin: 5,
  },
  progressDotActive: {
    backgroundColor: '#4a90e2',
    width: 12,
    height: 12,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  contentContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  explanationContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4a90e2',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 22,
  },
  explanationButton: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  explanationButtonText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  navigationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  agreementContainer: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4a90e2',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 16,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});
