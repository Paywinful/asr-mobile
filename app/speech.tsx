import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;


export default function SpeechQuestion() {
  const { language } = useLocalSearchParams();

const handleChoice = (isImpaired: boolean) => {
  if (!language) return;

  const isImpairedStr = isImpaired ? 'true' : 'false';

if (language === 'AKAN') {
  if (isImpaired) {
    router.push({
      pathname: '/etiology',
      params: { language, isImpaired: isImpairedStr },
    });
  } else {
    router.push({
      pathname: '/model',
      params: { language, isImpaired: isImpairedStr },
    });
  }
} else if (language === 'EWE') {
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.1,
  },
  title: {
    marginBottom: Height * 0.03,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    fontSize: Height * 0.035,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    width: Width * 0.8,
  },
  buttonText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: Height * 0.038,
  },
});
