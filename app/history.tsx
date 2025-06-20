import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteTranscript, getHistory } from '../store/historyStorage';

export default function HistoryScreen() {
  const [data, setData] = useState<string[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const load = async () => setData(await getHistory());
    if (isFocused) load();
  }, [isFocused]);

  const handleDelete = async index => {
    await deleteTranscript(index);
    const updated = await getHistory();
    setData(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transcription History</Text>
      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item}</Text>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, backgroundColor: '#f5faff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2e86de', marginTop:35,textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  text: { fontSize: 16, flex: 1, marginRight: 10 },
  delete: { color: 'red' },
});
