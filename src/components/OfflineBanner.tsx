// src/components/OfflineBanner.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📵  You're offline — showing cached content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
