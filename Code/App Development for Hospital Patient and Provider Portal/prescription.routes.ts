import { Router } from 'express';
import * as prescriptionController from '../controllers/prescription.controller';
import { authenticate, isProvider, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// Routes for both patients and providers
router.get('/:id', authenticate, isPatientOrProvider, prescriptionController.getPrescription);
router.get('/patient/:patientId', authenticate, isPatientOrProvider, prescriptionController.getPatientPrescriptions);

// Routes for providers only
router.post('/', authenticate, isProvider, prescriptionController.createPrescription);

// Routes for updating prescriptions (both can update with different permissions)
router.put('/:id', authenticate, isPatientOrProvider, prescriptionController.updatePrescription);

export default router;
