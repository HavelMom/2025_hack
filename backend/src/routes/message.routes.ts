import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate, isPatientOrProvider } from '../middleware/auth.middleware';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Routes for sending and receiving messages
router.post('/', isPatientOrProvider, messageController.sendMessage);
router.get('/conversations', isPatientOrProvider, messageController.getUserConversations);
router.get('/conversation/:userId', isPatientOrProvider, messageController.getConversation);
router.put('/:id/read', isPatientOrProvider, messageController.markMessageAsRead);

export default router;
