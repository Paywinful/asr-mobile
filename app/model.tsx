import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ModelScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  const isAvailable = ['Akan', 'Ewe'].includes(language || '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Model for {language}</Text>
      {isAvailable ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/record', params: { model: 'wav2vec', language } })}>
            <Text style={styles.buttonText}>Use wav2vec</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/record', params: { model: 'whisper', language } })}>
            <Text style={styles.buttonText}>Use Whisper</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.warning}>Model is still in production.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5faff' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold', color: '#2e86de' },
  button: { backgroundColor: '#2e86de', padding: 16, borderRadius: 12, marginBottom: 10, width: '80%' },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  warning: { fontSize: 16, color: 'gray', fontStyle: 'italic' },
});
