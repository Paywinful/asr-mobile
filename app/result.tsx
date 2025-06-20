import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function ResultScreen() {
  const { transcript } = useLocalSearchParams();
  const { language, model } = useLocalSearchParams<{ language: string; model: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transcription</Text>
      <Text style={styles.transcript}>{transcript}</Text>

      <TouchableOpacity
  style={styles.button}
  onPress={() =>
    router.push({
      pathname: '/record',
      params: {
        language: language as string,
        model: model as string,
      },
    })
  }
>
  <Text style={styles.buttonText}>Record Another</Text>
</TouchableOpacity>


      <TouchableOpacity onPress={() => router.push('/history')}>
        <Text style={styles.secondary}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5faff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e86de', marginBottom: 20 },
  transcript: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#2e86de', padding: 16, borderRadius: 12, marginBottom: 10, width: '80%' },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
  secondary: { color: '#2e86de', fontSize: 16, marginTop: 10 },
});
