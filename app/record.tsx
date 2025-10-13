import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Recorder from '../components/Recorder';
import Colors from '../constants/Colors';

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

  const modelName =
    effectiveModel === 'wav2vec' ? 'Model 1' : 'Model 2';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recording with {modelName}</Text>
        <Text style={styles.subTitle}>
          Language: {language || 'Not specified'}
        </Text>
        {params.isImpaired !== undefined && (
          <Text style={styles.subTitle}>
            Speech Impaired: {isSpeechImpaired ? 'Yes' : 'No'}
          </Text>
        )}
        {hasEtiology && (
          <Text style={styles.subTitle}>Etiology: {etiology}</Text>
        )}
      </View>

      <View style={styles.body}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Height * 0.025, alignItems: 'center' },
  title: { fontSize: Height * 0.03, fontWeight: 'bold', color: Colors.primary },
  subTitle: { fontSize: Height * 0.03, color: '#555', marginTop: Height * 0.004 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
