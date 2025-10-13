import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

const Height = Dimensions.get('window').height;


export default function ModelScreen() {
  const { language, isImpaired, etiology } = useLocalSearchParams<{
    language: string;
    isImpaired?: string;
    etiology?: string;
  }>();

  const isAvailable = ['AKAN', 'EWE'].includes(language || '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Model for {language}</Text>
      {isAvailable ? (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: '/record',
                params: {
                  model: 'wav2vec',
                  language,
                  isImpaired,
                  ...(etiology ? { etiology } : {}),
                },
              });
            }}
          >
            <Text style={styles.buttonText}>For longer Akan Phrases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: '/record',
                params: {
                  model: 'whisper',
                  language,
                  isImpaired,
                  ...(etiology ? { etiology } : {}),
                },
              });
            }}
          >
            <Text style={styles.buttonText}>For shorter Akan Phrases</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.warning}>Model is still in production.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: Height * 0.03,
    marginBottom: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    width: '80%',
  },
  buttonText: {
    color: Colors.white,
    fontSize: Height * 0.038,
    textAlign: 'center',
  },
  warning: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
