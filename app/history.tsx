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
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { deleteTranscript, getHistory } from '../store/historyStorage';

const Width = Dimensions.get('window').width;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/language')}
        >
          <FontAwesome name="chevron-left" size={14} color={Colors.text} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recent transcriptions</Text>
        <Text style={styles.caption}>
          Tap any entry to copy it instantly. Swipe down for the latest
          recordings.
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={
          data.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Your future transcriptions will appear here.</Text>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleCopy(item)}
            style={styles.item}
            activeOpacity={0.75}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemBadge}>
                <Text style={styles.itemBadgeLabel}>{index + 1}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <FontAwesome
                  name="trash"
                  size={16}
                  color={Colors.danger}
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    marginBottom: 18,
  },
  backLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: Height * 0.04,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: Height * 0.06,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBadgeLabel: {
    color: Colors.accent,
    fontWeight: '700',
  },
  deleteIcon: {
    padding: 4,
  },
  itemText: {
    color: Colors.text,
    fontSize: Height * 0.028,
    lineHeight: 24,
  },
});
