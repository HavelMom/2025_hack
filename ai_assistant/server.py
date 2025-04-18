# server.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from api import AssistantFnc

app = FastAPI()
assistant = AssistantFnc()

# Allow frontend requests (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or replace with ["http://localhost:19006"] for Expo Web
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoiceInput(BaseModel):
    inputText: str

@app.post("/ai/process-voice")
def process_voice(input_data: VoiceInput):
    text = input_data.inputText.lower()

    # Try matching keywords to functions
    if any(keyword in text for keyword in ["headache", "fever", "cough", "sore throat"]):
        assistant.record_symptom("headache", "moderate", "2 days")
        response = assistant.analyze_symptoms()
        actions = {"scheduleAppointment": False, "connectToProvider": False}

    elif any(keyword in text for keyword in ["appointment", "schedule", "book", "visit"]):
        response = assistant.schedule_appointment("primary care", "tomorrow", "morning")
        actions = {"scheduleAppointment": True, "connectToProvider": False}

    elif any(keyword in text for keyword in ["doctor", "provider", "message", "connect"]):
        response = "Okay, connecting you with your provider through our secure messaging system."
        actions = {"scheduleAppointment": False, "connectToProvider": True}

    else:
        response = "I'm not sure how to help with that. Could you describe your symptoms or ask to schedule an appointment?"
        actions = {"scheduleAppointment": False, "connectToProvider": False}

    return {
        "response": {
            "text": response,
            "intent": "parsed_input",
            "actions": actions
        }
    }

@app.post("/ai/diagnose")
def diagnose(input_data: VoiceInput):
    # Dummy diagnosis logic (replace with actual model if needed)
    return {
        "diagnoses": ["Common Cold", "Flu"] if "fever" in input_data.inputText.lower() else ["Unclear – further analysis needed"]
    }
