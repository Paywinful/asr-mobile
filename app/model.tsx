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

export default function ModelScreen() {
  const { language, isImpaired, etiology } = useLocalSearchParams<{
    language: string;
    isImpaired?: string;
    etiology?: string;
  }>();

  const isAvailable = ['AKAN', 'EWE'].includes(language || '');

  const goToRecord = (model: string) => {
    router.push({
      pathname: '/record',
      params: {
        model,
        language,
        isImpaired,
        ...(etiology ? { etiology } : {}),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.overline}>Model selection</Text>
        <Text style={styles.title}>Tune the engine for {language}</Text>
        <Text style={styles.caption}>
          Pick an acoustic model that best matches the content and pace of your
          speech. You can always switch later.
        </Text>
      </View>

      {isAvailable ? (
        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.modelCard}
            onPress={() => goToRecord('wav2vec')}
          >
            <Text style={styles.cardTitle}>Longer Text</Text>
            <Text style={styles.cardDesc}>
              Optimized for longer utterances and expressive narration.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>Recommended for recordings over a minute</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modelCard, styles.modelCardAlt]}
            onPress={() => goToRecord('whisper')}
          >
            <Text style={styles.cardTitle}>Shorter Text</Text>
            <Text style={styles.cardDesc}>
              Crisp results for short prompts and quick call-and-response flows.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>Ideal for recordings less than a minute</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>
            We are still calibrating models for {language}. Check back soon!
          </Text>
        </View>
      )}
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
  headerBlock: {
    marginBottom: Height * 0.035,
  },
  overline: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: Height * 0.045,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  cards: {
    marginTop: 8,
  },
  modelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 26,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt,
  },
  modelCardAlt: {
    backgroundColor: Colors.surfaceAlt,
  },
  cardTitle: {
    fontSize: Height * 0.038,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  cardFooter: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  cardFooterText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fallback: {
    marginTop: Height * 0.1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    padding: 24,
  },
  fallbackText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
