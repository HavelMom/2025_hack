// services/ai.ts
import axios from 'axios';
import { API_URL } from '../utils/api';

export async function diagnoseWithModel(text: string): Promise<string[]> {
  try {
    const response = await axios.post(`${API_URL}/ai/diagnose`, {
      inputText: text,
    });

    return response.data.diagnoses || [];
  } catch (error) {
    console.error('Error calling /ai/diagnose:', error);
    return ['Unable to retrieve diagnosis at this time.'];
  }
}
