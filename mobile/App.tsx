// mobile/App.tsx
import { registerRootComponent } from 'expo';
import ExpoRoot from 'expo-router/entry';          // ← note: import from 'expo-router/entry'
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';

function Root() {
  return (
    <PaperProvider>
      <AuthProvider>
        <ExpoRoot />   {/* no context prop here */}
      </AuthProvider>
    </PaperProvider>
  );
}

registerRootComponent(Root);
