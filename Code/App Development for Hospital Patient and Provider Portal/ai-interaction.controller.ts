import { Request, Response } from 'express';
import { AIInteraction, IAIInteraction } from '../models/ai-interaction.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Record AI interaction
export const recordAIInteraction = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      inputText, 
      responseText, 
      detectedIntent, 
      confidenceScore, 
      resultedInAppointment, 
      resultedInProviderTransfer 
    } = req.body;
    
    const userId = req.user.id;
    
    // Create AI interaction record
    const aiInteraction = new AIInteraction({
      userId,
      inputText,
      responseText,
      detectedIntent,
      confidenceScore,
      resultedInAppointment: resultedInAppointment || false,
      resultedInProviderTransfer: resultedInProviderTransfer || false,
      interactionTimestamp: new Date()
    });
    
    await aiInteraction.save();
    
    res.status(201).json({ message: 'AI interaction recorded successfully', aiInteraction });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get AI interactions for a user
export const getUserAIInteractions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    const aiInteractions = await AIInteraction.find({ userId })
      .sort({ interactionTimestamp: -1 });
    
    res.status(200).json(aiInteractions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process AI voice input (integration point with external AI system)
export const processAIVoiceInput = async (req: AuthRequest, res: Response) => {
  try {
    const { inputText } = req.body;
    const userId = req.user.id;
    
    // In a real implementation, this would call your external AI voice assistant
    // For now, we'll simulate a response
    
    // Simulate processing
    let detectedIntent = 'unknown';
    let confidenceScore = 0.7;
    let resultedInAppointment = false;
    let resultedInProviderTransfer = false;
    let responseText = 'I\'m sorry, I couldn\'t understand your request.';
    
    // Simple intent detection based on keywords
    if (inputText.toLowerCase().includes('appointment')) {
      detectedIntent = 'schedule_appointment';
      confidenceScore = 0.9;
      resultedInAppointment = true;
      responseText = 'I can help you schedule an appointment. What day works best for you?';
    } else if (inputText.toLowerCase().includes('doctor') || inputText.toLowerCase().includes('provider')) {
      detectedIntent = 'connect_to_provider';
      confidenceScore = 0.85;
      resultedInProviderTransfer = true;
      responseText = 'I\'ll connect you with your healthcare provider right away.';
    } else if (inputText.toLowerCase().includes('symptom') || inputText.toLowerCase().includes('pain')) {
      detectedIntent = 'symptom_analysis';
      confidenceScore = 0.8;
      responseText = 'Based on your symptoms, you might be experiencing a common cold. Would you like to schedule an appointment with your doctor?';
    }
    
    // Record the interaction
    const aiInteraction = new AIInteraction({
      userId,
      inputText,
      responseText,
      detectedIntent,
      confidenceScore,
      resultedInAppointment,
      resultedInProviderTransfer,
      interactionTimestamp: new Date()
    });
    
    await aiInteraction.save();
    
    res.status(200).json({
      message: 'AI voice input processed successfully',
      response: {
        text: responseText,
        intent: detectedIntent,
        confidence: confidenceScore,
        actions: {
          scheduleAppointment: resultedInAppointment,
          connectToProvider: resultedInProviderTransfer
        }
      },
      interactionId: aiInteraction._id
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
