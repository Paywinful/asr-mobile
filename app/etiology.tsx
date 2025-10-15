import { router, useLocalSearchParams } from 'expo-router';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const etiologies = ['Stammering', 'Cerebral Palsy', 'Cleft Palate'];

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.overline}>Personalise capture</Text>
        <Text style={styles.title}>Which scenario fits you best?</Text>
        <Text style={styles.caption}>
          Selecting an impairment helps us adapt the acoustic model for clearer
          recognition.
        </Text>
      </View>

      <View style={styles.cards}>
        {etiologies.map((etiology) => (
          <TouchableOpacity
            key={etiology}
            style={styles.card}
            onPress={() => handleEtiologySelect(etiology)}
          >
            <Text style={styles.cardTitle}>{etiology}</Text>
            <Text style={styles.cardCaption}>
              Tap to continue with tailored processing.
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.06,
    paddingTop: Height * 0.04,
  },
  header: {
    marginBottom: Height * 0.035,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: Height * 0.044,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  cards: {
    marginTop: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt,
  },
  cardTitle: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: Height * 0.034,
    marginBottom: 8,
  },
  cardCaption: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
