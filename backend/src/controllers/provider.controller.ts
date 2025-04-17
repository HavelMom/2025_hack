import { Request, Response } from 'express';
import { ProviderProfile, IProviderProfile } from '../models/provider-profile.model';
import { User, UserRole } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProviderPatient } from '../models/provider-patient.model';

// Get provider profile by ID
export const getProviderProfile = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.id;
    
    // If requesting own profile, use the authenticated user's ID
    const userId = providerId === 'me' ? req.user.id : providerId;
    
    const providerProfile = await ProviderProfile.findOne({ userId }).populate('userId', '-password');
    
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    res.status(200).json(providerProfile);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update provider profile
export const updateProviderProfile = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.id;
    
    // Only allow updating own profile
    if (providerId !== 'me' && providerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const userId = req.user.id;
    
    // Find profile
    const providerProfile = await ProviderProfile.findOne({ userId });
    
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Update fields
    const updatableFields = ['credentials', 'specialization', 'licenseNumber', 'department', 'officeLocation', 'workingHours'];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (providerProfile as any)[field] = req.body[field];
      }
    });
    
    await providerProfile.save();
    
    res.status(200).json({ message: 'Profile updated successfully', profile: providerProfile });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all providers
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    // Find all users with provider role
    const providerUsers = await User.find({ role: UserRole.PROVIDER }).select('-password');
    
    // Get their profiles
    const providerProfiles = await ProviderProfile.find({
      userId: { $in: providerUsers.map(user => user._id) }
    }).populate('userId', '-password');
    
    res.status(200).json(providerProfiles);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get provider's patients
export const getProviderPatients = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.id === 'me' ? req.user.id : req.params.id;
    
    // Find provider profile
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Find provider-patient relationships
    const relationships = await ProviderPatient.find({ 
      providerId: providerProfile._id 
    }).populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: '-password'
      }
    });
    
    res.status(200).json(relationships);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add patient to provider
export const addPatientToProvider = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.body;
    const providerId = req.params.id === 'me' ? req.user.id : req.params.id;
    
    // Find provider profile
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Check if patient exists
    const patientProfile = await User.findById(patientId);
    
    if (!patientProfile || patientProfile.role !== UserRole.PATIENT) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if relationship already exists
    const existingRelationship = await ProviderPatient.findOne({
      providerId: providerProfile._id,
      patientId
    });
    
    if (existingRelationship) {
      return res.status(400).json({ message: 'Patient already assigned to this provider' });
    }
    
    // Create new relationship
    const relationship = new ProviderPatient({
      providerId: providerProfile._id,
      patientId,
      relationshipStartDate: new Date()
    });
    
    await relationship.save();
    
    res.status(201).json({ message: 'Patient added to provider successfully', relationship });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
