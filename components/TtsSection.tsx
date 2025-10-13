import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import { TTS_ENDPOINT } from '../constants/api';

type TtsSectionProps = {
  transcript: string;
};

export default function TtsSection({ transcript }: TtsSectionProps) {
  const [text, setText] = useState(transcript);
  const endpointConfigured = TTS_ENDPOINT.trim().length > 0;

  const handleGenerate = () => {
    if (!endpointConfigured) {
      Alert.alert(
        'TTS Endpoint Needed',
        'Configure the text-to-speech endpoint in constants/api.ts to enable this feature.',
      );
      return;
    }

    Alert.alert(
      'Not Implemented',
      'Text-to-speech generation will become available once the endpoint is provided.',
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text to Speech</Text>
      <Text style={styles.caption}>
        Adjust the text below and generate speech once the endpoint is ready.
      </Text>

      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        style={styles.input}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.button,
          !endpointConfigured && styles.buttonDisabled,
        ]}
        onPress={handleGenerate}
        disabled={!endpointConfigured}
      >
        <Text style={styles.buttonText}>
          {endpointConfigured ? 'Generate Speech' : 'Awaiting Endpoint'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
