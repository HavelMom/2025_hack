import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import Voice from 'react-native-voice';
import NetInfo from '@react-native-community/netinfo';

/**
 * LiveKitVoiceInterface component handles the voice interaction with LiveKit
 * for the healthcare voice agent application.
 */
export default function LiveKitVoiceInterface({ 
  url, 
  token, 
  onTranscriptReceived, 
  onResponseReceived,
  onConnectionStateChange,
  isListening
}) {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const roomRef = useRef(null);
  
  // Initialize Voice recognition
  useEffect(() => {
    // Initialize voice recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    
    return () => {
      // Destroy voice recognition
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
  // Connect to LiveKit room
  useEffect(() => {
    if (!url || !token) return;
    
    const connectToRoom = async () => {
      try {
        setConnectionState('connecting');
        onConnectionStateChange('connecting');
        
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }
        
        // In a real implementation, this would connect to LiveKit
        // For demo purposes, we'll simulate a connection
        setTimeout(() => {
          setConnectionState('connected');
          onConnectionStateChange('connected');
          console.log('Connected to simulated LiveKit room');
        }, 2000);
        
      } catch (err) {
        console.error('Failed to connect to LiveKit room', err);
        setError(err.message);
        setConnectionState('error');
        onConnectionStateChange('error');
        Alert.alert('Connection Error', 'Failed to connect to voice service: ' + err.message);
      }
    };
    
    connectToRoom();
    
    return () => {
      // Disconnect from room when component unmounts
      if (roomRef.current) {
        // In a real implementation, this would disconnect from LiveKit
        setConnectionState('disconnected');
        onConnectionStateChange('disconnected');
      }
    };
  }, [url, token]);
  
  // Handle voice recording based on isListening prop
  useEffect(() => {
    const startVoiceRecognition = async () => {
      try {
        await Voice.start('en-US');
      } catch (e) {
        console.error('Error starting voice recognition', e);
      }
    };
    
    const stopVoiceRecognition = async () => {
      try {
        await Voice.stop();
      } catch (e) {
        console.error('Error stopping voice recognition', e);
      }
    };
    
    if (isListening && connectionState === 'connected') {
      startVoiceRecognition();
    } else if (!isListening && connectionState === 'connected') {
      stopVoiceRecognition();
    }
  }, [isListening, connectionState]);
  
  // Voice recognition event handlers
  const onSpeechStart = () => console.log('Speech started');
  const onSpeechRecognized = () => console.log('Speech recognized');
  const onSpeechEnd = () => console.log('Speech ended');
  const onSpeechError = (e) => console.error('Speech error', e);
  
  const onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      const transcript = e.value[0];
      onTranscriptReceived(transcript);
      
      // In a real implementation, this would send the transcript to LiveKit
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        onResponseReceived("I've received your message: " + transcript);
      }, 1000);
    }
  };
  
  const onSpeechPartialResults = (e) => {
    if (e.value && e.value.length > 0) {
      // Handle partial results if needed
    }
  };
  
  // Send a text message (for non-voice input)
  const sendTextMessage = (text) => {
    if (connectionState === 'connected') {
      onTranscriptReceived(text);
      
      // In a real implementation, this would send the message to LiveKit
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        onResponseReceived("I've received your message: " + text);
      }, 1000);
    } else {
      console.error('Cannot send message: not connected to room');
    }
  };
  
  return {
    connectionState,
    error,
    sendTextMessage
  };
}
