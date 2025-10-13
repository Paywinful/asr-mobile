import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const etiologies = [
  'Stammering',
  'Cerebral Palsy',
  'Cleft Palate',
];

export default function EtiologyScreen() {
  const { language, isImpaired } = useLocalSearchParams();

  const handleEtiologySelect = (etiology: string) => {
    router.push({
      pathname: '/record',
      params: {
        model: 'whisper',
        language,
        isImpaired,
        etiology,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Speech Impairment Type</Text>
      {etiologies.map((etiology) => (
        <TouchableOpacity
          key={etiology}
          style={styles.button}
          onPress={() => handleEtiologySelect(etiology)}
        >
          <Text style={styles.buttonText}>{etiology}</Text>
        </TouchableOpacity>
      ))}
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
    fontSize: Height * 0.035,
    marginBottom: Height * 0.03,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
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
    fontSize: Height * 0.038,
    textAlign: 'center',
  },
});
