# Healthcare Application Database Schema

## Overview
This document outlines the database schema for the healthcare application with dual-portal system for patients and healthcare providers. The schema is designed to support all required functionality including user authentication, appointment scheduling, medical records management, prescription handling, and messaging.

## Tables

### Users
The central table for authentication and user management with role-based access control.

```
Table: users
- id: UUID (Primary Key)
- email: String (Unique)
- password_hash: String
- phone_number: String
- full_name: String
- role: Enum ['patient', 'provider']
- created_at: Timestamp
- updated_at: Timestamp
```

### Patient Profiles
Extended information specific to patients.

```
Table: patient_profiles
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- insurance_number: String
- ssn: String (encrypted)
- date_of_birth: Date
- address: String
- emergency_contact: String
- emergency_contact_phone: String
- created_at: Timestamp
- updated_at: Timestamp
```

### Provider Profiles
Extended information specific to healthcare providers.

```
Table: provider_profiles
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- credentials: String
- specialization: String
- license_number: String
- department: String
- office_location: String
- working_hours: JSON
- created_at: Timestamp
- updated_at: Timestamp
```

### Provider-Patient Relationships
Mapping between providers and their patients.

```
Table: provider_patients
- id: UUID (Primary Key)
- provider_id: UUID (Foreign Key -> provider_profiles.id)
- patient_id: UUID (Foreign Key -> patient_profiles.id)
- relationship_start_date: Date
- status: Enum ['active', 'inactive']
- created_at: Timestamp
- updated_at: Timestamp
```

### Appointments
Manages scheduling between patients and providers.

```
Table: appointments
- id: UUID (Primary Key)
- patient_id: UUID (Foreign Key -> patient_profiles.id)
- provider_id: UUID (Foreign Key -> provider_profiles.id)
- date_time: Timestamp
- duration_minutes: Integer
- status: Enum ['scheduled', 'completed', 'cancelled', 'no-show']
- type: Enum ['regular', 'follow-up', 'emergency']
- reason: String
- notes: Text
- created_at: Timestamp
- updated_at: Timestamp
```

### Medical Records
Stores patient medical history and visit information.

```
Table: medical_records
- id: UUID (Primary Key)
- patient_id: UUID (Foreign Key -> patient_profiles.id)
- provider_id: UUID (Foreign Key -> provider_profiles.id)
- appointment_id: UUID (Foreign Key -> appointments.id, Nullable)
- record_date: Date
- diagnosis: Text
- symptoms: Text
- treatment: Text
- notes: Text
- created_at: Timestamp
- updated_at: Timestamp
```

### Prescriptions
Manages medication prescriptions for patients.

```
Table: prescriptions
- id: UUID (Primary Key)
- patient_id: UUID (Foreign Key -> patient_profiles.id)
- provider_id: UUID (Foreign Key -> provider_profiles.id)
- medical_record_id: UUID (Foreign Key -> medical_records.id, Nullable)
- medication_name: String
- dosage: String
- frequency: String
- duration: String
- start_date: Date
- end_date: Date
- refills: Integer
- status: Enum ['active', 'completed', 'cancelled']
- notes: Text
- created_at: Timestamp
- updated_at: Timestamp
```

### Messages
Enables communication between patients and providers.

```
Table: messages
- id: UUID (Primary Key)
- sender_id: UUID (Foreign Key -> users.id)
- receiver_id: UUID (Foreign Key -> users.id)
- content: Text
- read: Boolean
- sent_at: Timestamp
- read_at: Timestamp (Nullable)
```

### AI Assistant Interactions
Records interactions with the AI voice assistant for reference and improvement.

```
Table: ai_interactions
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- input_text: Text
- response_text: Text
- detected_intent: String
- confidence_score: Float
- resulted_in_appointment: Boolean
- resulted_in_provider_transfer: Boolean
- interaction_timestamp: Timestamp
```

## Relationships

1. **Users to Profiles**: One-to-one relationship between users and either patient_profiles or provider_profiles based on role.

2. **Providers to Patients**: Many-to-many relationship through provider_patients table.

3. **Appointments**: 
   - Each appointment belongs to one patient and one provider
   - Can be linked to medical records and prescriptions

4. **Medical Records**:
   - Each record belongs to one patient
   - Each record is created by one provider
   - Can be optionally linked to an appointment

5. **Prescriptions**:
   - Each prescription belongs to one patient
   - Each prescription is issued by one provider
   - Can be optionally linked to a medical record

6. **Messages**:
   - Direct communication between any two users
   - Tracked by sender and receiver

7. **AI Interactions**:
   - Each interaction is associated with one user
   - Tracks outcomes for analytics and improvement

## Indexes

For performance optimization, the following indexes should be created:

1. users(email)
2. appointments(patient_id, date_time)
3. appointments(provider_id, date_time)
4. medical_records(patient_id, record_date)
5. prescriptions(patient_id, status)
6. messages(sender_id, receiver_id, sent_at)
7. messages(receiver_id, read)

## Security Considerations

1. Sensitive data like SSN should be encrypted at rest
2. Password hashes must use strong algorithms (bcrypt/Argon2)
3. Role-based access control must be enforced at the API level
4. All database operations should be logged for audit purposes
5. HIPAA compliance requirements must be implemented throughout
