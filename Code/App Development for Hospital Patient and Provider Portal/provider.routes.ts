import { Router } from 'express';
import * as providerController from '../controllers/provider.controller';
import { authenticate, isProvider, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// Routes for patients and providers
router.get('/:id', authenticate, isPatientOrProvider, providerController.getProviderProfile);
router.get('/', authenticate, isPatientOrProvider, providerController.getAllProviders);

// Routes for providers only
router.put('/:id', authenticate, isProvider, providerController.updateProviderProfile);
router.get('/:id/patients', authenticate, isProvider, providerController.getProviderPatients);
router.post('/:id/patients', authenticate, isProvider, providerController.addPatientToProvider);

export default router;
