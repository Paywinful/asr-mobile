import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SpeechQuestion() {
  const { language } = useLocalSearchParams();

const handleChoice = (isImpaired: boolean) => {
  if (!language) return;

  const isImpairedStr = isImpaired ? 'true' : 'false';

  if (language === 'Akan') {
    if (isImpaired) {
      router.push({
        pathname: '/record',
        params: { model: 'whisper', language, isImpaired: isImpairedStr },
      });
    } else {
      router.push({
        pathname: '/model',
        params: { language, isImpaired: isImpairedStr },
      });
    }
  } else if (language === 'Ewe') {
    if (isImpaired) {
      alert('Speech-impaired model for Ewe is not available yet.');
    } else {
      router.push({
        pathname: '/record',
        params: { model: 'wav2vec', language, isImpaired: isImpairedStr },
      });
    }
  } else {
    alert('Model for this language is still in production.');
  }
};





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you speech impaired?</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleChoice(true)}>
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleChoice(false)}>
        <Text style={styles.buttonText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5faff' },
  title: { fontSize: 24, marginBottom: 30, fontWeight: 'bold', color: '#2e86de', textAlign: 'center' },
  button: { backgroundColor: '#2e86de', padding: 16, borderRadius: 12, marginBottom: 10, width: '80%' },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});
