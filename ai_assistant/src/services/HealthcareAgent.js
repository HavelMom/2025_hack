import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';

export async function diagnoseWithModel(transcript) {
  const { data } = await axios.post(`${API_URL}/api/ai/diagnose`, { prompt: transcript });
  return data.diseases;  // an array of strings
}


/**
 * HealthcareAgent component handles the healthcare-specific logic
 * including symptom analysis, diagnosis suggestions, and appointment scheduling
 */
export default function HealthcareAgent({ 
  transcript, 
  onResponseGenerated,
  onDiagnosisGenerated,
  onAppointmentRequested
}) {
  const [processing, setProcessing] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  
  // Process transcript when it changes
  useEffect(() => {
    if (!transcript || transcript.trim() === '') return;
    
    // Start processing
    setProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      processTranscript(transcript);
      setProcessing(false);
    }, 1500);
  }, [transcript]);
  
  // Process the transcript to extract symptoms and generate responses
  const processTranscript = (text) => {
    // Simple keyword-based symptom extraction (would be replaced with actual NLP)
    const symptomKeywords = {
      'headache': 'head pain',
      'fever': 'elevated body temperature',
      'cough': 'respiratory irritation',
      'sore throat': 'throat pain or irritation',
      'runny nose': 'nasal discharge',
      'fatigue': 'feeling of tiredness',
      'pain': 'discomfort',
      'nausea': 'feeling of sickness',
      'dizzy': 'feeling of unsteadiness',
      'vomiting': 'forceful expulsion of stomach contents'
    };
    
    // Extract symptoms from text
    const extractedSymptoms = [];
    Object.keys(symptomKeywords).forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        extractedSymptoms.push({
          name: keyword,
          description: symptomKeywords[keyword]
        });
      }
    });
    
    // Update symptoms state if new symptoms found
    if (extractedSymptoms.length > 0) {
      setSymptoms(prev => {
        // Combine previous and new symptoms, removing duplicates
        const combined = [...prev];
        extractedSymptoms.forEach(symptom => {
          if (!combined.some(s => s.name === symptom.name)) {
            combined.push(symptom);
          }
        });
        return combined;
      });
    }
    
    // Generate diagnosis if we have symptoms
    if (extractedSymptoms.length > 0 || symptoms.length > 0) {
      generateDiagnosis([...symptoms, ...extractedSymptoms]);
    }
    
    // Check for appointment request
    if (text.toLowerCase().includes('appointment') || 
        text.toLowerCase().includes('schedule') || 
        text.toLowerCase().includes('book')) {
      handleAppointmentRequest(text);
    } else {
      // Generate general response
      generateResponse(text, extractedSymptoms);
    }
  };
  
  // Generate a diagnosis based on symptoms
  const generateDiagnosis = (currentSymptoms) => {
    // Simple rule-based diagnosis (would be replaced with actual medical AI)
    let possibleConditions = [];
    
    const symptomNames = currentSymptoms.map(s => s.name);
    
    if (symptomNames.includes('fever') && symptomNames.includes('cough')) {
      possibleConditions.push('Common cold');
      possibleConditions.push('Flu');
      
      if (symptomNames.includes('sore throat')) {
        possibleConditions.push('Strep throat');
      }
    }
    
    if (symptomNames.includes('headache')) {
      possibleConditions.push('Tension headache');
      
      if (symptomNames.includes('nausea') || symptomNames.includes('dizzy')) {
        possibleConditions.push('Migraine');
      }
    }
    
    if (symptomNames.includes('runny nose') && symptomNames.includes('sneezing')) {
      possibleConditions.push('Allergies');
    }
    
    // Default if no specific conditions matched
    if (possibleConditions.length === 0 && currentSymptoms.length > 0) {
      possibleConditions.push('General discomfort');
    }
    
    // Create diagnosis object
    const newDiagnosis = {
      symptoms: currentSymptoms,
      possibleConditions: possibleConditions,
      recommendations: generateRecommendations(possibleConditions),
      severity: assessSeverity(currentSymptoms, possibleConditions)
    };
    
    setDiagnosis(newDiagnosis);
    
    // Notify parent component
    if (onDiagnosisGenerated) {
      onDiagnosisGenerated(newDiagnosis);
    }
    
    return newDiagnosis;
  };
  
  // Generate treatment recommendations
  const generateRecommendations = (conditions) => {
    const recommendations = [];
    
    // General recommendations
    recommendations.push('Rest and stay hydrated');
    
    // Condition-specific recommendations
    if (conditions.includes('Common cold') || conditions.includes('Flu')) {
      recommendations.push('Over-the-counter pain relievers for fever and aches');
      recommendations.push('Warm liquids like tea with honey for sore throat');
    }
    
    if (conditions.includes('Tension headache')) {
      recommendations.push('Over-the-counter pain relievers');
      recommendations.push('Stress reduction techniques');
    }
    
    if (conditions.includes('Migraine')) {
      recommendations.push('Rest in a quiet, dark room');
      recommendations.push('Over-the-counter migraine medication');
    }
    
    if (conditions.includes('Allergies')) {
      recommendations.push('Over-the-counter antihistamines');
      recommendations.push('Avoid known allergens');
    }
    
    // When to see a doctor
    if (conditions.length > 0) {
      recommendations.push('If symptoms persist for more than 3 days or worsen, consult with your healthcare provider');
    }
    
    return recommendations;
  };
  
  // Assess severity of condition
  const assessSeverity = (symptoms, conditions) => {
    // Simple severity assessment (would be replaced with actual medical logic)
    if (symptoms.length > 3) {
      return 'moderate';
    } else if (conditions.includes('Strep throat') || conditions.includes('Migraine')) {
      return 'moderate';
    } else {
      return 'mild';
    }
  };
  
  // Generate a response based on the transcript and extracted symptoms
  const generateResponse = (text, extractedSymptoms) => {
    let response = '';
    
    // If we have a diagnosis, include it in the response
    if (diagnosis) {
      response = `Based on your symptoms (${diagnosis.symptoms.map(s => s.name).join(', ')}), `;
      
      if (diagnosis.possibleConditions.length > 0) {
        response += `you may have ${diagnosis.possibleConditions.join(' or ')}. `;
      }
      
      response += 'I recommend: ' + diagnosis.recommendations.join('. ') + '. ';
      
      if (diagnosis.severity === 'moderate') {
        response += 'Your condition appears to be moderate. ';
      } else if (diagnosis.severity === 'mild') {
        response += 'Your condition appears to be mild. ';
      }
      
      response += 'Would you like me to schedule an appointment with your healthcare provider?';
    } 
    // If we just extracted new symptoms
    else if (extractedSymptoms.length > 0) {
      response = `I've noted your symptoms: ${extractedSymptoms.map(s => s.name).join(', ')}. `;
      response += 'Please tell me more about how you're feeling or any other symptoms you're experiencing.';
    } 
    // General response
    else {
      response = 'I'm here to help with your health concerns. Please describe your symptoms so I can assist you better.';
    }
    
    // Send response to parent component
    if (onResponseGenerated) {
      onResponseGenerated(response);
    }
    
    return response;
  };
  
  // Handle appointment scheduling requests
  const handleAppointmentRequest = (text) => {
    // Extract appointment details (would be more sophisticated in real implementation)
    const appointmentRequest = {
      requested: true,
      preferredTime: text.includes('morning') ? 'morning' : 
                     text.includes('afternoon') ? 'afternoon' : 
                     text.includes('evening') ? 'evening' : 'any',
      urgency: diagnosis?.severity || 'routine',
      reason: diagnosis ? `Possible ${diagnosis.possibleConditions.join(' or ')}` : 'Health consultation'
    };
    
    // Notify parent component
    if (onAppointmentRequested) {
      onAppointmentRequested(appointmentRequest);
    }
    
    // Generate response about appointment
    const response = `I'll help you schedule an appointment with your healthcare provider. ` +
                     `Based on your request, I'll look for a ${appointmentRequest.preferredTime} slot. ` +
                     `I'll need to contact your provider to confirm availability. ` +
                     `Would you like me to proceed with scheduling?`;
    
    // Send response to parent component
    if (onResponseGenerated) {
      onResponseGenerated(response);
    }
  };
  
  return {
    processing,
    symptoms,
    diagnosis,
    generateResponse,
    handleAppointmentRequest
  };
}
