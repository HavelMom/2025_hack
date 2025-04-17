import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate, isPatient, isProvider, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// Routes for both patients and providers
router.get('/:id', authenticate, isPatientOrProvider, appointmentController.getAppointment);

// Routes primarily for patients
router.post('/', authenticate, isPatient, appointmentController.createAppointment);
router.get('/patient/:patientId', authenticate, isPatientOrProvider, appointmentController.getPatientAppointments);

// Routes primarily for providers
router.get('/provider/:providerId', authenticate, isPatientOrProvider, appointmentController.getProviderAppointments);

// Routes for updating appointments (both can update with different permissions)
router.put('/:id', authenticate, isPatientOrProvider, appointmentController.updateAppointment);

export default router;
