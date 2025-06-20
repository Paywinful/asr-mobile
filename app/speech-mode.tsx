import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import Colors from '../constants/Colors';

export default function SpeechMode() {
  const { language } = useLocalSearchParams<{ language: string }>();

  const handleSelection = (isImpaired: boolean) => {
    if (isImpaired) {
      router.push({ pathname: '/record', params: { language, model: 'whisper' } });
    } else {
      router.push({ pathname: '/model-select', params: { language } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Are you speech impaired?</Text>
      <PrimaryButton label="Yes" onPress={() => handleSelection(true)} />
      <PrimaryButton label="No" onPress={() => handleSelection(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
});
