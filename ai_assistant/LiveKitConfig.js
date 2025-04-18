import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

/**
 * LiveKitConfig provides configuration and utilities for LiveKit integration
 * in the healthcare voice agent application.
 */

// Default LiveKit server URL (replace with your actual LiveKit server in production)
const DEFAULT_LIVEKIT_URL = 'wss://example.livekit.cloud';

// Environment variable keys
const ENV_KEYS = {
  LIVEKIT_URL: 'LIVEKIT_URL',
  LIVEKIT_API_KEY: 'LIVEKIT_API_KEY',
  LIVEKIT_API_SECRET: 'LIVEKIT_API_SECRET'
};

// Secure storage keys
const STORAGE_KEYS = {
  LIVEKIT_TOKEN: 'livekit_token'
};

/**
 * Get LiveKit configuration from environment variables or constants
 */
export const getLiveKitConfig = () => {
  // Try to get from Expo Constants (from .env file)
  const envConfig = {
    url: Constants.expoConfig?.extra?.[ENV_KEYS.LIVEKIT_URL] || DEFAULT_LIVEKIT_URL,
    apiKey: Constants.expoConfig?.extra?.[ENV_KEYS.LIVEKIT_API_KEY],
    apiSecret: Constants.expoConfig?.extra?.[ENV_KEYS.LIVEKIT_API_SECRET]
  };
  
  return envConfig;
};

/**
 * Save LiveKit token to secure storage
 */
export const saveLiveKitToken = async (token) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.LIVEKIT_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error saving LiveKit token:', error);
    return false;
  }
};

/**
 * Get LiveKit token from secure storage
 */
export const getLiveKitToken = async () => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.LIVEKIT_TOKEN);
  } catch (error) {
    console.error('Error getting LiveKit token:', error);
    return null;
  }
};

/**
 * Clear LiveKit token from secure storage
 */
export const clearLiveKitToken = async () => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.LIVEKIT_TOKEN);
    return true;
  } catch (error) {
    console.error('Error clearing LiveKit token:', error);
    return false;
  }
};

/**
 * Generate a room name for LiveKit
 * In a real app, this would be more sophisticated and possibly server-generated
 */
export const generateRoomName = (userId) => {
  return `healthcare-voice-${userId}-${Date.now()}`;
};

/**
 * Mock function to get a LiveKit token
 * In a real app, this would call your backend to generate a token
 */
export const getMockLiveKitToken = async (userId, roomName) => {
  // This is a placeholder - in a real app, you would call your backend
  // to generate a token using the LiveKit server SDK
  console.log(`Getting mock token for user ${userId} in room ${roomName}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock token
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MzAyODQ4MDAsImlzcyI6IkFQSV9LRVkiLCJuYW1lIjoidXNlciIsIm5iZiI6MTY4MDI4NDgwMCwic3ViIjoidXNlciIsInZpZGVvIjp7InJvb20iOiJyb29tIiwicm9vbUpvaW4iOnRydWV9fQ.mock_signature';
};

export default {
  getLiveKitConfig,
  saveLiveKitToken,
  getLiveKitToken,
  clearLiveKitToken,
  generateRoomName,
  getMockLiveKitToken
};
