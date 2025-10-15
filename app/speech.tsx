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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.tag}>Quick Setup</Text>
        <Text style={styles.title}>Do you identify as speech impaired?</Text>
        <Text style={styles.caption}>
          We tailor the models we use to make sure your speech is captured as
          accurately as possible.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => handleChoice(true)}
          >
            <Text style={styles.primaryLabel}>Yes, enable support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleChoice(false)}
          >
            <Text style={styles.secondaryLabel}>No, continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.06,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    paddingVertical: 36,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 18,
  },
  title: {
    fontSize: Height * 0.042,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    marginTop: 28,
  },
  actionBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  primaryLabel: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt,
    paddingVertical: 16,
  },
  secondaryLabel: {
    textAlign: 'center',
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});
