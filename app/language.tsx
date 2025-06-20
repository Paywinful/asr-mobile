import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const languages = ['Akan', 'Ewe', 'Dagbani', 'Dagaare', 'Ikposo'];

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
  title: { fontSize: 24, marginBottom: 30, fontWeight: 'bold', color: '#2e86de' },
  button: { backgroundColor: '#2e86de', padding: 16, borderRadius: 12, marginBottom: 10, width: '80%' },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});
