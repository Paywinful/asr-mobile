import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Recorder from '../components/Recorder';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function RecordScreen() {
  const params = useLocalSearchParams<{
    language?: string | string[];
    model?: string | string[];
    isImpaired?: string | string[];
    etiology?: string | string[];
  }>();

  const language = typeof params.language === 'string' ? params.language : '';
  const model = typeof params.model === 'string' ? params.model : '';
  const etiology =
    typeof params.etiology === 'string' && params.etiology.length > 0
      ? params.etiology
      : undefined;
  const isSpeechImpaired =
    typeof params.isImpaired === 'string' ? params.isImpaired === 'true' : false;

  const hasEtiology = Boolean(etiology && etiology !== 'null');
  const fallbackModel = isSpeechImpaired || hasEtiology ? 'whisper' : 'wav2vec';
  const effectiveModel = hasEtiology
    ? 'whisper'
    : model.trim().length
    ? model
    : fallbackModel;


  const modelName: string = effectiveModel === 'whisper'
  ? 'Shorter Text'
  : 'Longer Text';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerAccent} />
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>Active session</Text>
          <Text style={styles.headerTitle}>{language || 'Choose language'}</Text>
          <Text style={styles.headerSubtitle}>
            {modelName} •{' '}
            {isSpeechImpaired ? 'speech support enabled' : 'standard capture'}
          </Text>

          <View style={styles.chipRow}>
            {etiology ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Etiology: {etiology}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.chip, styles.chatChip]}
              onPress={() => router.push('/tts')}
            >
              <Text style={styles.chipText}>Need voice replies?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.recorderWrapper}>
        <Recorder
          language={language}
          model={effectiveModel}
          isImpaired={isSpeechImpaired}
          etiology={etiology}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.05,
    paddingTop: Height * 0.03,
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 26,
    padding: 24,
    marginBottom: Height * 0.03,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerAccent: {
    width: 6,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    marginRight: 18,
  },
  headerContent: {
    flex: 1,
  },
  headerLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: Height * 0.04,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  chip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  chatChip: {
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  recorderWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});
