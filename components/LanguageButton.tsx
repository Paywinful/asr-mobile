import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';

export default function LanguageButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
