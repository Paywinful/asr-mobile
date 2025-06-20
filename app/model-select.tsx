import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import Colors from '../constants/Colors';

export default function ModelSelect() {
  const { language } = useLocalSearchParams<{ language: string }>();

  const handleModelChoice = (model: 'whisper' | 'wav2vec') => {
    router.push({ pathname: '/record', params: { language, model } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Speech Model</Text>
      <PrimaryButton label="Whisper" onPress={() => handleModelChoice('whisper')} />
      <PrimaryButton label="Wav2Vec" onPress={() => handleModelChoice('wav2vec')} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
});
