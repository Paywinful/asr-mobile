import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Recorder from '../components/Recorder';


export default function RecordScreen() {
  const { language, model } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recording with {model}</Text>
        <Text style={styles.subTitle}>Language: {language}</Text>
      </View>
      <View style={styles.body}>
        {/* ✅ Pass props explicitly */}
        <Recorder language={language} model={model} />
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
