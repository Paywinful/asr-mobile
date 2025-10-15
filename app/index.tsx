import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors';

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/language');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.card}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>UG VoiceTranscribe</Text>
        <Text style={styles.caption}>
          Smarter speech capturing and lifelike voice responses, built for
          modern conversations.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.secondary + '33',
    opacity: 0.8,
    top: 160,
  },
  card: {
    width: '82%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    paddingVertical: 48,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 32,
    borderRadius: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  caption: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
