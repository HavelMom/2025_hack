import { Request, Response } from 'express';
import { User, UserRole, IUser } from '../models/user.model';
import { PatientProfile } from '../models/patient-profile.model';
import { ProviderProfile } from '../models/provider-profile.model';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phoneNumber, role, profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
      phoneNumber,
      role
    });

    await user.save();

    // Create profile based on role
    if (role === UserRole.PATIENT) {
      const patientProfile = new PatientProfile({
        userId: user._id,
        ...profileData
      });
      await patientProfile.save();
    } else if (role === UserRole.PROVIDER) {
      const providerProfile = new ProviderProfile({
        userId: user._id,
        ...profileData
      });
      await providerProfile.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile;
    if (user.role === UserRole.PATIENT) {
      profile = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === UserRole.PROVIDER) {
      profile = await ProviderProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      profile
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
