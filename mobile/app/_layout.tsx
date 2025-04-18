// mobile/app/_layout.tsx

import React from 'react';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  return (
    <PaperProvider>
      <AuthProvider>
        {/* All your app/screens (login.tsx, appointments.tsx, ai‑assistant.tsx, etc.) */}
        {/* will render here under the auth context and Paper theme */}
        <Slot />
      </AuthProvider>
    </PaperProvider>
  );
}
