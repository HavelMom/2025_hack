import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';
import { authenticate, isProvider, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// Routes for both patients and providers
router.get('/:id', authenticate, isPatientOrProvider, medicalRecordController.getMedicalRecord);
router.get('/patient/:patientId', authenticate, isPatientOrProvider, medicalRecordController.getPatientMedicalRecords);

// Routes for providers only
router.post('/', authenticate, isProvider, medicalRecordController.createMedicalRecord);
router.put('/:id', authenticate, isProvider, medicalRecordController.updateMedicalRecord);

export default router;
