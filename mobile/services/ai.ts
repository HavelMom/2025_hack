// mobile/services/ai.ts

import axios from 'axios';
import { API_URL } from '../utils/api';

export async function diagnoseWithModel(prompt: string): Promise<string[]> {
  const { data } = await axios.post(
    ${API_URL}/api/ai/diagnose,
    { prompt }
  );
  return data.diseases;
}