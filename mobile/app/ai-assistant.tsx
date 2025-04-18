// mobile/app/ai‑assistant.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  useTheme
} from 'react-native-paper';
import { diagnoseWithModel } from './services/ai';

export default function AIAssistant() {
  const { colors } = useTheme();
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [diseases, setDiseases] = useState<string[] | null>(null);

  const handleDiagnose = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setDiseases(null);
    try {
      const result = await diagnoseWithModel(input);
      setDiseases(result);
    } catch (err) {
      console.error('AI diagnose error', err);
      // you could also show an Alert here
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Describe your symptoms"
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleDiagnose}
        disabled={loading || !input.trim()}
      >
        {loading ? 'Analyzing…' : 'Get Diagnosis'}
      </Button>

      {loading && <ActivityIndicator animating style={styles.loading} />}

      {diseases && (
        <View style={styles.results}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Possible Conditions:
          </Text>
          {diseases.map((d, i) => (
            <Text key={i} style={styles.item}>
              • {d}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  loading: {
    marginVertical: 16,
  },
  results: {
    marginTop: 24,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  item: {
    marginLeft: 8,
    marginBottom: 4,
  },
});
