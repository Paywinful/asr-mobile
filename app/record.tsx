import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Recorder from '../components/Recorder';

export default function RecordScreen() {
  const { language, model, isImpaired } = useLocalSearchParams<{
    language: string;
    model: string;
    isImpaired?: string;
  }>();

  const isSpeechImpaired = isImpaired === 'true';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recording with {model}</Text>
        <Text style={styles.subTitle}>Language: {language}</Text>
        {isImpaired !== undefined && (
          <Text style={styles.subTitle}>
            Speech Impaired: {isSpeechImpaired ? 'Yes' : 'No'}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        {/* ✅ Pass all props including isImpaired if needed */}
        <Recorder language={language} model={model} isImpaired={isSpeechImpaired} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff' },
  header: { padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e86de' },
  subTitle: { fontSize: 16, color: '#555', marginTop: 4 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
