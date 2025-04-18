import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  Text, Card, Button, Title, TextInput, ActivityIndicator, useTheme, IconButton
} from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const { token, user } = useAuth();
  const theme = useTheme();
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();

  const processVoiceInput = async (text) => {
    if (!text.trim()) return;

    try {
      setProcessing(true);
      const userMessage = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);
      setInput('');

      const response = await axios.post(
        `${API_URL}/ai/process-voice`,
        { inputText: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: response.data.response.text,
        isUser: false,
        intent: response.data.response.intent,
        actions: response.data.response.actions,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiResponse]);

      if (aiResponse.actions.scheduleAppointment) {
        Alert.alert(
          'Schedule Appointment',
          'Would you like to schedule an appointment now?',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Yes', onPress: () => router.push('/(patient)/schedule-appointment') }
          ]
        );
      }

      if (aiResponse.actions.connectToProvider) {
        Alert.alert(
          'Connect to Provider',
          'Would you like to message your healthcare provider?',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Yes', onPress: () => router.push('/(patient)/messages') }
          ]
        );
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      Alert.alert('Error', 'Failed to process your request');
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        error: true,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Title style={styles.title}>AI Health Assistant</Title>
        <Text style={styles.subtitle}>
          Describe your symptoms or ask for help with appointments
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        style={styles.conversationContainer}
        contentContainerStyle={[styles.conversationContent, { paddingBottom: 24 }]}
      >
        {conversation.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Hello! I'm your AI health assistant. How can I help you today?
            </Text>
            <Text style={styles.suggestionText}>You can ask me about:</Text>
            <View style={styles.suggestionsContainer}>
              <Button
                mode="outlined"
                style={styles.suggestionButton}
                onPress={() => processVoiceInput("I have a headache and fever")}
              >
                Symptom analysis
              </Button>
              <Button
                mode="outlined"
                style={styles.suggestionButton}
                onPress={() => processVoiceInput("I need to schedule an appointment")}
              >
                Schedule appointment
              </Button>
              <Button
                mode="outlined"
                style={styles.suggestionButton}
                onPress={() => processVoiceInput("Connect me with my doctor")}
              >
                Contact provider
              </Button>
            </View>
          </View>
        ) : (
          conversation.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
                message.error && styles.errorBubble
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestampText}>{formatTime(message.timestamp)}</Text>
            </View>
          ))
        )}

        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            style={styles.textInput}
            disabled={processing}
            right={
              <TextInput.Icon
                icon="microphone"
                onPress={() => Alert.alert('Voice Input', 'Voice input would be activated here')}
              />
            }
          />
          <IconButton
            icon="send"
            size={24}
            disabled={processing || !input.trim()}
            onPress={() => processVoiceInput(input)}
            style={styles.sendButton}
          />
        </View>

        <Button
          mode="outlined"
          onPress={() => router.replace(user?.role === 'provider' ? '/(provider)/' : '/(patient)/')}
          style={styles.backButton}
        >
          Back to Home
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  conversationContainer: { flex: 1 },
  conversationContent: { paddingHorizontal: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  suggestionText: { fontSize: 14, marginBottom: 10 },
  suggestionsContainer: { width: '100%' },
  suggestionButton: { marginBottom: 10 },
  messageBubble: {
    padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '80%', elevation: 1,
  },
  userBubble: {
    backgroundColor: '#e3f2fd', alignSelf: 'flex-end', borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#ffebee',
  },
  messageText: { fontSize: 16 },
  timestampText: {
    fontSize: 10, color: '#666', alignSelf: 'flex-end', marginTop: 4,
  },
  processingContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 12 },
  processingText: { fontSize: 14, color: '#666', marginLeft: 8 },
  footer: { paddingHorizontal: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
  },
  textInput: { flex: 1, backgroundColor: '#fff' },
  sendButton: { marginLeft: 8 },
  backButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
