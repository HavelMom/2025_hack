import asyncio
import logging
import os
import json
from typing import Dict, List, Optional, Any

from dotenv import load_dotenv
import openai
from api import AssistantFnc, Symptom, Severity

load_dotenv()

# Configure logging
logger = logging.getLogger("healthcare-voice-assistant")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# OpenAI API key is now configured when creating the client

class SimpleVoiceAssistant:
    """Simple implementation of a voice assistant using OpenAI"""
    
    def __init__(self):
        self.assistant_fnc = AssistantFnc()
        self.conversation_history = []
        self.system_prompt = (
            "You are a healthcare voice assistant. Your purpose is to help users describe their symptoms, "
            "provide possible diagnoses, offer treatment recommendations, and schedule appointments with healthcare providers. "
            "You should use clear, concise, and compassionate language. Avoid medical jargon when possible and explain "
            "terms when necessary. For serious symptoms, always recommend seeking professional medical advice. "
            "Remember that you are not a replacement for professional medical care. "
            "Use short and concise responses, and avoid usage of unpronounceable punctuation."
        )
        
    def start(self):
        """Start the voice assistant"""
        logger.info("Healthcare voice assistant started")
        print("Healthcare Voice Assistant is running. Type 'exit' to quit.")
        print("Assistant: Hello, I'm your healthcare assistant. How can I help you with your health concerns today?")
        
        # Main interaction loop
        while True:
            user_input = input("You: ")
            if user_input.lower() == 'exit':
                print("Assistant: Goodbye! Take care of your health.")
                break
                
            response = self.process_input(user_input)
            print(f"Assistant: {response}")
    
    def process_input(self, text: str) -> str:
        """Process user input and generate response"""
        logger.info(f"Processing user input: {text}")
        
        # Add user message to conversation history
        self.conversation_history.append({"role": "user", "content": text})
        
        # Check for function calls
        response = self._check_for_functions(text)
        if response:
            self.conversation_history.append({"role": "assistant", "content": response})
            return response
            
        # If no function calls detected, use OpenAI to generate response
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.conversation_history)
            
            # Use the updated OpenAI API (v1.0.0+)
            client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=150,
                temperature=0.7
            )
            
            response = completion.choices[0].message.content
            self.conversation_history.append({"role": "assistant", "content": response})
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm sorry, I encountered an error processing your request. Please try again."
    
    def _check_for_functions(self, text: str) -> Optional[str]:
        """Check if the user input should trigger any functions"""
        text_lower = text.lower()
        
        # Check for symptom recording
        symptom_keywords = ["symptom", "feeling", "experiencing", "having", "suffer"]
        if any(keyword in text_lower for keyword in symptom_keywords):
            # Try to extract symptom information
            for symptom_name in [s.value for s in Symptom]:
                if symptom_name in text_lower:
                    # Try to extract severity
                    severity = Severity.MODERATE.value  # Default to moderate
                    for sev in [s.value for s in Severity]:
                        if sev in text_lower:
                            severity = sev
                            break
                    
                    # Try to extract duration
                    duration = "recently"  # Default
                    duration_keywords = ["day", "week", "month", "hour", "year"]
                    for keyword in duration_keywords:
                        if keyword in text_lower:
                            # Simple extraction, could be improved
                            for i in range(1, 10):
                                if f"{i} {keyword}" in text_lower or f"{i}{keyword}" in text_lower:
                                    duration = f"{i} {keyword}"
                                    break
                            if duration == "recently" and keyword in text_lower:
                                duration = f"a {keyword}"
                    
                    return self.assistant_fnc.record_symptom(symptom_name, severity, duration)
        
        # Check for symptom analysis
        analysis_keywords = ["diagnose", "diagnosis", "what do i have", "what could it be", "analyze", "analyse", "what's wrong"]
        if any(keyword in text_lower for keyword in analysis_keywords):
            return self.assistant_fnc.analyze_symptoms()
        
        # Check for recommendations
        recommendation_keywords = ["recommend", "suggestion", "advice", "what should i do", "treatment", "help"]
        if any(keyword in text_lower for keyword in recommendation_keywords):
            return self.assistant_fnc.get_recommendations()
        
        # Check for appointment scheduling
        appointment_keywords = ["appointment", "schedule", "book", "visit", "see a doctor"]
        if any(keyword in text_lower for keyword in appointment_keywords):
            provider_type = "primary care"
            if "specialist" in text_lower:
                provider_type = "specialist"
            
            # Default date and time
            preferred_date = "tomorrow"
            preferred_time = "afternoon"
            
            # Try to extract date
            date_keywords = ["today", "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday"]
            for date in date_keywords:
                if date in text_lower:
                    preferred_date = date
                    break
            
            # Try to extract time
            time_keywords = ["morning", "afternoon", "evening", "night"]
            for time in time_keywords:
                if time in text_lower:
                    preferred_time = time
                    break
            
            return self.assistant_fnc.schedule_appointment(provider_type, preferred_date, preferred_time)
        
        # No function calls detected
        return None


def main():
    """Main entry point for the application"""
    try:
        assistant = SimpleVoiceAssistant()
        assistant.start()
    except KeyboardInterrupt:
        print("\nExiting healthcare voice assistant...")
    except Exception as e:
        logger.error(f"Error running voice assistant: {e}")
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()