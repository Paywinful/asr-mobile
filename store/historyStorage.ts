import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'TRANSCRIPTION_HISTORY';

export const saveTranscript = async (text: string) => {
  const current = await getHistory();
  const updated = [text, ...current];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getHistory = async (): Promise<string[]> => {
  const stored = await AsyncStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteTranscript = async (index: number) => {
  const current = await getHistory();
  current.splice(index, 1);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(current));
};
