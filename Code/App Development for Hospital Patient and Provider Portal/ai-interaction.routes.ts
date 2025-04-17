import { Router } from 'express';
import * as aiInteractionController from '../controllers/ai-interaction.controller';
import { authenticate, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// All AI interaction routes require authentication
router.use(authenticate);

// Routes for AI interactions
router.post('/record', isPatientOrProvider, aiInteractionController.recordAIInteraction);
router.get('/history', isPatientOrProvider, aiInteractionController.getUserAIInteractions);
router.post('/process-voice', isPatientOrProvider, aiInteractionController.processAIVoiceInput);

export default router;
