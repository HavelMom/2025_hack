import { Request, Response } from 'express';
import { MedicalRecord, IMedicalRecord } from '../models/medical-record.model';
import { PatientProfile } from '../models/patient-profile.model';
import { ProviderProfile } from '../models/provider-profile.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

// Create a new medical record
export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, treatment, notes } = req.body;
    
    // Verify provider
    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Verify patient
    const patientProfile = await PatientProfile.findById(patientId);
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Create medical record
    const medicalRecord = new MedicalRecord({
      patientId,
      providerId: providerProfile._id,
      appointmentId,
      recordDate: new Date(),
      diagnosis,
      symptoms,
      treatment,
      notes
    });
    
    await medicalRecord.save();
    
    res.status(201).json({ message: 'Medical record created successfully', medicalRecord });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get medical record by ID
export const getMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const recordId = req.params.id;
    
    const medicalRecord = await MedicalRecord.findById(recordId)
      .populate('patientId')
      .populate('providerId')
      .populate('appointmentId');
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if user has access to this record
    if (req.user.role === UserRole.PATIENT) {
      const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
      if (!patientProfile || medicalRecord.patientId.toString() !== patientProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this medical record' });
      }
    } else if (req.user.role === UserRole.PROVIDER) {
      const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
      if (!providerProfile) {
        return res.status(403).json({ message: 'Not authorized to access this medical record' });
      }
      // In a real app, you might want to check if this provider has a relationship with the patient
    }
    
    res.status(200).json(medicalRecord);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update medical record
export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const recordId = req.params.id;
    const { diagnosis, symptoms, treatment, notes } = req.body;
    
    // Only providers can update medical records
    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
    if (!providerProfile) {
      return res.status(403).json({ message: 'Not authorized to update medical records' });
    }
    
    const medicalRecord = await MedicalRecord.findById(recordId);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if this provider created the record
    if (medicalRecord.providerId.toString() !== providerProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this medical record' });
    }
    
    // Update fields
    if (diagnosis) medicalRecord.diagnosis = diagnosis;
    if (symptoms) medicalRecord.symptoms = symptoms;
    if (treatment) medicalRecord.treatment = treatment;
    if (notes) medicalRecord.notes = notes;
    
    await medicalRecord.save();
    
    res.status(200).json({ message: 'Medical record updated successfully', medicalRecord });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get medical records for patient
export const getPatientMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId === 'me' ? req.user.id : req.params.patientId;
    
    // Get patient profile
    const patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Check authorization if not requesting own records
    if (patientId !== req.user.id && req.user.role !== UserRole.PROVIDER) {
      return res.status(403).json({ message: 'Not authorized to access these medical records' });
    }
    
    // Get medical records
    const medicalRecords = await MedicalRecord.find({ patientId: patientProfile._id })
      .populate('providerId')
      .populate('appointmentId')
      .sort({ recordDate: -1 });
    
    res.status(200).json(medicalRecords);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
