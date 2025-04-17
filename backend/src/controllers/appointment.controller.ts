import { Request, Response } from 'express';
import { Appointment, AppointmentStatus, AppointmentType, IAppointment } from '../models/appointment.model';
import { PatientProfile } from '../models/patient-profile.model';
import { ProviderProfile } from '../models/provider-profile.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

// Create a new appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, dateTime, durationMinutes, type, reason, notes } = req.body;
    
    // Get patient profile
    const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Get provider profile
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patientId: patientProfile._id,
      providerId: providerProfile._id,
      dateTime: new Date(dateTime),
      durationMinutes: durationMinutes || 30,
      type: type || AppointmentType.REGULAR,
      reason,
      notes
    });
    
    await appointment.save();
    
    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment by ID
export const getAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('providerId');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user has access to this appointment
    if (req.user.role === UserRole.PATIENT) {
      const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
      if (!patientProfile || appointment.patientId.toString() !== patientProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this appointment' });
      }
    } else if (req.user.role === UserRole.PROVIDER) {
      const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
      if (!providerProfile || appointment.providerId.toString() !== providerProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this appointment' });
      }
    }
    
    res.status(200).json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { dateTime, durationMinutes, status, type, reason, notes } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user has access to update this appointment
    if (req.user.role === UserRole.PATIENT) {
      const patientProfile = await PatientProfile.findOne({ userId: req.user.id });
      if (!patientProfile || appointment.patientId.toString() !== patientProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
      
      // Patients can only update certain fields
      if (dateTime) appointment.dateTime = new Date(dateTime);
      if (reason) appointment.reason = reason;
      if (notes) appointment.notes = notes;
      
      // Patients can only cancel appointments, not change other statuses
      if (status === AppointmentStatus.CANCELLED) {
        appointment.status = AppointmentStatus.CANCELLED;
      }
    } else if (req.user.role === UserRole.PROVIDER) {
      const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });
      if (!providerProfile || appointment.providerId.toString() !== providerProfile._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
      
      // Providers can update all fields
      if (dateTime) appointment.dateTime = new Date(dateTime);
      if (durationMinutes) appointment.durationMinutes = durationMinutes;
      if (status) appointment.status = status;
      if (type) appointment.type = type;
      if (reason) appointment.reason = reason;
      if (notes) appointment.notes = notes;
    }
    
    await appointment.save();
    
    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments for patient
export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId === 'me' ? req.user.id : req.params.patientId;
    
    // Get patient profile
    const patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Check authorization if not requesting own appointments
    if (patientId !== req.user.id && req.user.role !== UserRole.PROVIDER) {
      return res.status(403).json({ message: 'Not authorized to access these appointments' });
    }
    
    // Get appointments
    const appointments = await Appointment.find({ patientId: patientProfile._id })
      .populate('providerId')
      .sort({ dateTime: 1 });
    
    res.status(200).json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments for provider
export const getProviderAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.providerId === 'me' ? req.user.id : req.params.providerId;
    
    // Get provider profile
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    if (!providerProfile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    
    // Check authorization if not requesting own appointments
    if (providerId !== req.user.id && req.user.role !== UserRole.PROVIDER) {
      return res.status(403).json({ message: 'Not authorized to access these appointments' });
    }
    
    // Get appointments
    const appointments = await Appointment.find({ providerId: providerProfile._id })
      .populate('patientId')
      .sort({ dateTime: 1 });
    
    res.status(200).json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
