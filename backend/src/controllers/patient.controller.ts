import { Request, Response } from 'express';
import { PatientProfile, IPatientProfile } from '../models/patient-profile.model';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get patient profile by ID
export const getPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;
    
    // If requesting own profile, use the authenticated user's ID
    const userId = patientId === 'me' ? req.user.id : patientId;
    
    const patientProfile = await PatientProfile.findOne({ userId }).populate('userId', '-password');
    
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // If not requesting own profile, check if provider has access to this patient
    if (patientId !== 'me' && req.user.role === UserRole.PROVIDER) {
      // In a real app, check provider-patient relationship here
      // For now, we'll allow all providers to access patient profiles
    }
    
    res.status(200).json(patientProfile);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update patient profile
export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;
    
    // Only allow updating own profile
    if (patientId !== 'me' && patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const userId = req.user.id;
    
    // Find profile
    const patientProfile = await PatientProfile.findOne({ userId });
    
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Update fields
    const updatableFields = ['insuranceNumber', 'dateOfBirth', 'address', 'emergencyContact', 'emergencyContactPhone'];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (patientProfile as any)[field] = req.body[field];
      }
    });
    
    await patientProfile.save();
    
    res.status(200).json({ message: 'Profile updated successfully', profile: patientProfile });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all patients (for providers only)
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    // Find all users with patient role
    const patientUsers = await User.find({ role: UserRole.PATIENT }).select('-password');
    
    // Get their profiles
    const patientProfiles = await PatientProfile.find({
      userId: { $in: patientUsers.map(user => user._id) }
    }).populate('userId', '-password');
    
    res.status(200).json(patientProfiles);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
