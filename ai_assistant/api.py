import enum
from typing import Annotated, List, Optional, Dict, Any
import logging

logger = logging.getLogger("healthcare-assistant")
logger.setLevel(logging.INFO)


class Symptom(enum.Enum):
    HEADACHE = "headache"
    FEVER = "fever"
    COUGH = "cough"
    SORE_THROAT = "sore_throat"
    FATIGUE = "fatigue"
    NAUSEA = "nausea"
    DIZZINESS = "dizziness"
    SHORTNESS_OF_BREATH = "shortness_of_breath"
    CHEST_PAIN = "chest_pain"
    RASH = "rash"


class Severity(enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class UrgencyLevel(enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class AssistantFnc:
    def __init__(self) -> None:
        self._patient_symptoms = []
        self._patient_info = {}

    def record_symptom(self, symptom_name, severity_level, duration):
        """Record a patient's symptom
        
        Args:
            symptom_name: The specific symptom
            severity_level: The severity of the symptom (mild, moderate, severe)
            duration: How long the symptom has been present (e.g., '2 days', '1 week')
        """
        logger.info("Recording symptom: %s, severity: %s, duration: %s", symptom_name, severity_level, duration)
        
        # Convert string inputs to enum values if needed
        try:
            symptom = Symptom(symptom_name.lower()) if isinstance(symptom_name, str) else symptom_name
            severity = Severity(severity_level.lower()) if isinstance(severity_level, str) else severity_level
        except (ValueError, KeyError):
            # Handle case where input doesn't match enum
            symptom = symptom_name
            severity = severity_level
        
        self._patient_symptoms.append({
            "symptom": symptom,
            "severity": severity,
            "duration": duration
        })
        
        severity_value = getattr(severity, "value", severity)
        symptom_value = getattr(symptom, "value", symptom)
        
        return f"I've recorded that you're experiencing {severity_value} {symptom_value} for {duration}."

    def analyze_symptoms(self):
        """Analyze symptoms and provide possible diagnoses"""
        logger.info("Analyzing symptoms: %s", self._patient_symptoms)
        
        if not self._patient_symptoms:
            return "I don't have any symptoms recorded yet. Please tell me what symptoms you're experiencing."
        
        # Simple symptom analysis logic
        diagnoses = []
        urgency = UrgencyLevel.LOW
        
        # Extract symptom and severity values
        symptoms = []
        severities = []
        for s in self._patient_symptoms:
            symptom = s["symptom"]
            severity = s["severity"]
            
            # Handle both enum and string values
            if hasattr(symptom, "value"):
                symptoms.append(symptom)
            else:
                try:
                    symptoms.append(Symptom(symptom.lower()))
                except (ValueError, AttributeError):
                    symptoms.append(symptom)
                    
            if hasattr(severity, "value"):
                severities.append(severity)
            else:
                try:
                    severities.append(Severity(severity.lower()))
                except (ValueError, AttributeError):
                    severities.append(severity)
        
        # Check for severe symptoms that require immediate attention
        has_chest_pain = any(s == Symptom.CHEST_PAIN or (isinstance(s, str) and s.lower() == "chest_pain") for s in symptoms)
        has_shortness_of_breath = any(s == Symptom.SHORTNESS_OF_BREATH or (isinstance(s, str) and s.lower() == "shortness_of_breath") for s in symptoms)
        has_severe = any(s == Severity.SEVERE or (isinstance(s, str) and s.lower() == "severe") for s in severities)
        
        if (has_chest_pain or has_shortness_of_breath) and has_severe:
            urgency = UrgencyLevel.HIGH
            diagnoses.append("Possible cardiac or respiratory emergency - seek immediate medical attention")
        
        # Check for common cold/flu symptoms
        has_fever = any(s == Symptom.FEVER or (isinstance(s, str) and s.lower() == "fever") for s in symptoms)
        has_cough = any(s == Symptom.COUGH or (isinstance(s, str) and s.lower() == "cough") for s in symptoms)
        has_sore_throat = any(s == Symptom.SORE_THROAT or (isinstance(s, str) and s.lower() == "sore_throat") for s in symptoms)
        
        if has_fever and (has_cough or has_sore_throat):
            diagnoses.append("Common cold or flu")
            if has_severe:
                urgency = UrgencyLevel.MODERATE
        
        # Check for migraine
        has_headache = any(s == Symptom.HEADACHE or (isinstance(s, str) and s.lower() == "headache") for s in symptoms)
        has_nausea = any(s == Symptom.NAUSEA or (isinstance(s, str) and s.lower() == "nausea") for s in symptoms)
        has_dizziness = any(s == Symptom.DIZZINESS or (isinstance(s, str) and s.lower() == "dizziness") for s in symptoms)
        
        if has_headache and (has_nausea or has_dizziness):
            diagnoses.append("Possible migraine")
        
        # Default response if no specific patterns matched
        if not diagnoses:
            diagnoses.append("Non-specific symptoms - general health check recommended")
        
        # Prepare response
        response = "Based on your symptoms, here are possible conditions: " + ", ".join(diagnoses)
        response += f". The urgency level is {urgency.value}."
        
        # Add recommendations based on urgency
        if urgency == UrgencyLevel.HIGH:
            response += " I recommend seeking immediate medical attention."
        elif urgency == UrgencyLevel.MODERATE:
            response += " I recommend consulting with a healthcare provider soon."
        else:
            response += " I recommend rest, staying hydrated, and monitoring your symptoms."
            
        return response

    def get_recommendations(self):
        """Get treatment recommendations for symptoms"""
        logger.info("Getting recommendations for symptoms: %s", self._patient_symptoms)
        
        if not self._patient_symptoms:
            return "I don't have any symptoms recorded yet. Please tell me what symptoms you're experiencing."
        
        recommendations = ["Rest and stay hydrated"]
        
        # Add specific recommendations based on symptoms
        for symptom_data in self._patient_symptoms:
            symptom = symptom_data["symptom"]
            
            # Handle both enum and string values
            symptom_value = None
            if hasattr(symptom, "value"):
                symptom_value = symptom.value
            else:
                symptom_value = str(symptom).lower()
            
            if symptom_value == "headache":
                recommendations.append("Consider taking over-the-counter pain relievers like acetaminophen or ibuprofen")
                recommendations.append("Rest in a quiet, dark room if sensitive to light or sound")
            
            elif symptom_value == "fever":
                recommendations.append("Consider taking over-the-counter fever reducers like acetaminophen or ibuprofen")
                recommendations.append("Use a cool compress if fever is high")
            
            elif symptom_value in ["cough", "sore_throat"]:
                recommendations.append("Try warm liquids like tea with honey")
                recommendations.append("Consider throat lozenges for sore throat")
            
            elif symptom_value == "nausea":
                recommendations.append("Eat small, bland meals")
                recommendations.append("Avoid strong odors and greasy foods")
        
        # Add general advice
        recommendations.append("Contact your healthcare provider if symptoms worsen or persist")
        
        return "Here are some recommendations: " + "; ".join(recommendations) + "."

    def schedule_appointment(self, provider_type, preferred_date, preferred_time):
        """Schedule an appointment with a healthcare provider
        
        Args:
            provider_type: Type of healthcare provider (e.g., 'primary care', 'specialist')
            preferred_date: Preferred date for the appointment
            preferred_time: Preferred time for the appointment
        """
        logger.info("Scheduling appointment with %s on %s at %s", provider_type, preferred_date, preferred_time)
        
        # In a real implementation, this would connect to a scheduling system
        # For now, we'll simulate a successful scheduling
        
        return f"I've sent a request to schedule an appointment with a {provider_type} provider on {preferred_date} at {preferred_time}. You'll receive a confirmation shortly. Is there anything else you need help with?"

    def record_patient_info(self, info_type, info_value):
        """Record patient information
        
        Args:
            info_type: Type of information (e.g., 'allergies', 'medications', 'medical history')
            info_value: The information to record
        """
        logger.info("Recording patient info: %s = %s", info_type, info_value)
        self._patient_info[info_type] = info_value
        return f"I've recorded your {info_type}: {info_value}"