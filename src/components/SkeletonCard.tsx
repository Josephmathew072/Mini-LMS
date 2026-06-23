import { useTheme } from '@/context/ThemeContext';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

function SkeletonCard() {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.surface, opacity }]}>
      <View style={[styles.image, { backgroundColor: colors.border }]} />
      <View style={styles.body}>
        <View style={[styles.line, { backgroundColor: colors.border, width: '80%' }]} />
        <View style={[styles.line, { backgroundColor: colors.border, width: '60%', marginTop: 6 }]} />
        <View style={[styles.line, { backgroundColor: colors.border, width: '40%', marginTop: 6 }]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonList() {
  return (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#e2e8f0',
  },
  body: {
    padding: 12,
  },
  line: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
});
