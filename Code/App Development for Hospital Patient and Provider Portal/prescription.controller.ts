import { Request, Response } from 'express';
import { Prescription, PrescriptionStatus, IPrescription } from '../models/prescription.model';
import { PatientProfile } from '../models/patient-profile.model';
import { ProviderProfile } from '../models/provider-profile.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

// Create a new prescription
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      patientId, 
      medicalRecordId, 
      medicationName, 
      dosage, 
      frequency, 
      duration, 
      startDate, 
      endDate, 
      refills, 
      notes 
    } = req.body;
    
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
    
    // Create prescription
    const prescription = new Prescription({
      patientId,
      providerId: providerProfile._id,
      medicalRecordId,
      medicationName,
      dosage,
      frequency,
      duration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      refills: refills || 0,
      notes
    });
    
    await prescription.save();
    
    res.status(201).json({ message: 'Prescription created successfully', prescription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get prescription by ID
export const getPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptionId = req.params.id;
    
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId')
      .populate('providerId')
      .populate('medicalRecordId');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if user has access to this prescription
    if (req.user.role === UserRole.PATIENT) {
      const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
      if (!patientProfile || prescription.patientId.toString() !== patientProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this prescription' });
      }
    } else if (req.user.role === UserRole.PROVIDER) {
      const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
      if (!providerProfile) {
        return res.status(403).json({ message: 'Not authorized to access this prescription' });
      }
      // In a real app, you might want to check if this provider has a relationship with the patient
    }
    
    res.status(200).json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update prescription
export const updatePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptionId = req.params.id;
    const { 
      medicationName, 
      dosage, 
      frequency, 
      duration, 
      startDate, 
      endDate, 
      refills, 
      status,
      notes 
    } = req.body;
    
    // Only providers can update prescriptions (except for status)
    const prescription = await Prescription.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (req.user.role === UserRole.PROVIDER) {
      const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
      if (!providerProfile) {
        return res.status(403).json({ message: 'Provider profile not found' });
      }
      
      // Check if this provider created the prescription
      if (prescription.providerId.toString() !== providerProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this prescription' });
      }
      
      // Update fields
      if (medicationName) prescription.medicationName = medicationName;
      if (dosage) prescription.dosage = dosage;
      if (frequency) prescription.frequency = frequency;
      if (duration) prescription.duration = duration;
      if (startDate) prescription.startDate = new Date(startDate);
      if (endDate) prescription.endDate = new Date(endDate);
      if (refills !== undefined) prescription.refills = refills;
      if (status) prescription.status = status;
      if (notes) prescription.notes = notes;
    } else if (req.user.role === UserRole.PATIENT) {
      // Patients can only update status to cancelled
      const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
      if (!patientProfile || prescription.patientId.toString() !== patientProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this prescription' });
      }
      
      if (status === PrescriptionStatus.CANCELLED) {
        prescription.status = PrescriptionStatus.CANCELLED;
      } else {
        return res.status(403).json({ message: 'Patients can only cancel prescriptions' });
      }
    }
    
    await prescription.save();
    
    res.status(200).json({ message: 'Prescription updated successfully', prescription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get prescriptions for patient
export const getPatientPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId === 'me' ? req.user.id : req.params.patientId;
    
    // Get patient profile
    const patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Check authorization if not requesting own prescriptions
    if (patientId !== req.user.id && req.user.role !== UserRole.PROVIDER) {
      return res.status(403).json({ message: 'Not authorized to access these prescriptions' });
    }
    
    // Get prescriptions
    const prescriptions = await Prescription.find({ patientId: patientProfile._id })
      .populate('providerId')
      .populate('medicalRecordId')
      .sort({ startDate: -1 });
    
    res.status(200).json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
