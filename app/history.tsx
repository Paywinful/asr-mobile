import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import { deleteTranscript, getHistory } from '../store/historyStorage';

const Height = Dimensions.get('window').height;

export default function HistoryScreen() {
  const [data, setData] = useState<string[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const load = async () => setData(await getHistory());
    if (isFocused) {
      load();
    }
  }, [isFocused]);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to clipboard');
  };

  const handleDelete = async (index: number) => {
    Alert.alert('Remove entry?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTranscript(index);
          const updated = await getHistory();
          setData(updated);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topflex}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/language')}
        >
          <FontAwesome name="home" size={16} color={Colors.primary} />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Transcription History</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={
          data.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No transcriptions yet</Text>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleCopy(item)}
            style={styles.item}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <Text style={styles.index}>{index + 1}.</Text>
              <Text style={styles.text}>{item}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dff1ff',
  },
  backText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  index: {
    width: 24,
    color: '#777',
    fontSize: 16,
  },
  text: {
    fontSize: Height * 0.038,
    flex: 1,
    color: Colors.text,
  },
  delete: {
    color: Colors.danger,
    fontWeight: '500',
    fontSize: 14,
  },
  topflex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
});
