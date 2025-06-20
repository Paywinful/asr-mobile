import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/language');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/splash-icon.png')} style={styles.logo} />
      <Text style={styles.text}>VoiceTranscribe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2e86de' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  text: { fontSize: 28, color: 'white', fontWeight: 'bold' },
});
