import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate, isPatient, isProvider, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// Routes for patients and providers
router.get('/:id', authenticate, isPatientOrProvider, patientController.getPatientProfile);

// Routes for patients only
router.put('/:id', authenticate, isPatient, patientController.updatePatientProfile);

// Routes for providers only
router.get('/', authenticate, isProvider, patientController.getAllPatients);

export default router;
