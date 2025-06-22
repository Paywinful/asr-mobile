import { router } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const languages = ['Akan', 'Ewe', 'Dagbani', 'Dagaare', 'Ikposo'];

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height

const handleLanguageSelect = (lang: string) => {
  const availableLanguages = ['Akan', 'Ewe'];
  if (availableLanguages.includes(lang)) {
    router.push({ pathname: '/speech', params: { language: lang } });
  } else {
    alert('Model for ' + lang + ' is still in production.');
  }
};


export default function LanguageScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/history')}>
        <Text style={styles.historyText}>History</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Choose a Language</Text>
      {languages.map(lang => (
        <TouchableOpacity
          key={lang}
          style={styles.button}
          onPress={() => handleLanguageSelect(lang)}
        >
          <Text style={styles.buttonText}>{lang}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5faff' },
  title: { fontSize: 24, marginBottom: Height * 0.035, fontWeight: 'bold', color: '#2e86de' },
  button: { backgroundColor: '#2e86de', padding: Height * 0.016, borderRadius: 12, marginBottom: 10, width: Width * 0.8 },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  historyBtn: {
    position: 'absolute',
    top:Height * 0.07,
    right: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dff1ff',
  },
  historyText: {
    color: '#2e86de',
    fontWeight: '600',
  },
});
