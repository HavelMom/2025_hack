import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, Title, ActivityIndicator, useTheme, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{
              paddingTop: insets.top + 16,
              paddingBottom: 140,
            }}
          >
            <Title style={styles.title}>Messages</Title>

            {conversations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No conversations found</Text>
                  <Text style={styles.emptySubText}>
                    Start a conversation with your healthcare provider
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.user.id}
                  style={styles.card}
                  onPress={() => router.push(`/(patient)/conversation/${conversation.user.id}`)}
                >
                  <Card.Content>
                    <View style={styles.conversationHeader}>
                      <View style={styles.userInfo}>
                        <Avatar.Text
                          size={50}
                          label={conversation.user.fullName
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        />
                        <View style={styles.userTextContainer}>
                          <Title>{conversation.user.fullName}</Title>
                          <Text numberOfLines={1} style={styles.previewText}>
                            {conversation.latestMessage?.content || 'No messages yet'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.metaInfo}>
                        {conversation.latestMessage && (
                          <Text style={styles.timeText}>
                            {formatDate(conversation.latestMessage.sentAt)}
                          </Text>
                        )}
                        {conversation.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push('/(patient)/new-message')}
              style={{ marginBottom: 12 }}
            >
              New Message
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.replace(user?.role === 'provider' ? '/(provider)/' : '/(patient)/')}
            >
              Back to Home
            </Button>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  scrollView: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12 },
  card: { marginHorizontal: 16, marginBottom: 12, elevation: 2 },
  emptyCard: { marginHorizontal: 16, marginBottom: 16, padding: 10, alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#666', textAlign: 'center' },
  conversationHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userTextContainer: { marginLeft: 15, flex: 1 },
  previewText: { color: '#666', fontSize: 14 },
  metaInfo: { alignItems: 'flex-end' },
  timeText: { fontSize: 12, color: '#666', marginBottom: 5 },
  unreadBadge: {
    backgroundColor: '#1976D2', borderRadius: 12, width: 24, height: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});