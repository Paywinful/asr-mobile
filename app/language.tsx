import { router } from 'expo-router';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

const languages = ['AKAN', 'EWE', 'DAGBANI', 'DAGAARE', 'IKPOSO'];

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const handleLanguageSelect = (lang: string) => {
  const availableLanguages = ['AKAN'];
  if (availableLanguages.includes(lang)) {
    router.push({ pathname: '/speech', params: { language: lang } });
  } else {
    alert(`We are still training our ${lang} models. Hang tight!`);
  }
};

const renderLanguageCard = ({ item }: { item: string }) => (
  <TouchableOpacity
    key={item}
    style={styles.languageCard}
    onPress={() => handleLanguageSelect(item)}
    activeOpacity={0.85}
  >
    <Text style={styles.languageLabel}>{item}</Text>
    <Text style={styles.languageMeta}>
      {['AKAN'].includes(item) ? 'Ready to use' : 'Coming soon'}
    </Text>
  </TouchableOpacity>
);

export default function LanguageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Select Your Language</Text>
          <Text style={styles.sectionCaption}>
            Pick a language to start recording and transcribing in seconds.
          </Text>
        </View>
        <View style={styles.ctaGroup}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.secondaryBtnLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/tts')}
          >
            <Text style={styles.secondaryBtnLabel}>Voice Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={languages}
        keyExtractor={(item) => item}
        renderItem={renderLanguageCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.helperCard}>
        <View style={styles.helperPill} />
        <View style={styles.helperTextBlock}>
          <Text style={styles.helperTitle}>Need voice replies?</Text>
          <Text style={styles.helperCaption}>
            Jump into the Voice Chat area to type anything and receive lifelike
            audio responses instantly.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.helperButton}
          onPress={() => router.push('/tts')}
        >
          <Text style={styles.helperButtonLabel}>Open chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.07,
    paddingTop: Height * 0.04,
  },
  header: {
    marginBottom: Height * 0.04,
  },
  sectionTitle: {
    fontSize: Height * 0.038,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionCaption: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ctaGroup: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'center'
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  secondaryBtnLabel: {
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: Height * 0.26,
  },
  languageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: Height * 0.03,
    paddingHorizontal: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt,
  },
  languageLabel: {
    fontSize: Height * 0.036,
    fontWeight: '600',
    color: Colors.text,
  },
  languageMeta: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  helperCard: {
    position: 'absolute',
    bottom: Height * 0.04,
    left: Width * 0.06,
    right: Width * 0.06,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  helperPill: {
    width: 12,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    marginRight: 16,
  },
  helperTextBlock: {
    flex: 1,
  },
  helperTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  helperCaption: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  helperButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginLeft: 12,
  },
  helperButtonLabel: {
    color: Colors.white,
    fontWeight: '600',
  },
});
