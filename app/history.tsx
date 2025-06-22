import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
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

  const handleDelete = async (index: number) => {
    await deleteTranscript(index);
    const updated = await getHistory();
    setData(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topflex}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/language')}>
        <Text style={styles.backText}>← Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Transcription History</Text>
      </View>

      {data.length === 0 ? (
        <Text style={styles.empty}>No transcriptions yet</Text>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#f5faff',
  },
  backBtn: {
    // position: 'absolute',
    // top: 40,
    // left: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dff1ff',
    zIndex: 10,
  },
  backText: {
    color: '#2e86de',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 20,
    color: '#2e86de',
    // marginTop: 35,
    textAlign: 'center',
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
    color: '#555',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  delete: {
    color: 'red',
    fontWeight: '500',
  },
  topflex:{
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,

  }
});
