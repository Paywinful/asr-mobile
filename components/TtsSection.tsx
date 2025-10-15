import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { TTS_ENDPOINT } from '../constants/api';

type TtsSectionProps = {
  transcript: string;
};

export default function TtsSection({ transcript }: TtsSectionProps) {
  const endpointConfigured = TTS_ENDPOINT.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.badge} />
      <View style={styles.textBlock}>
        <Text style={styles.title}>Need it spoken back?</Text>
        <Text style={styles.caption}>
          Jump into the voice chat to send custom prompts and receive audio
          responses. We prefill it with your latest transcript.
        </Text>
        {!endpointConfigured ? (
          <Text style={styles.notice}>
            Configure the TTS endpoint to enable real audio playback.
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: '/tts', params: { seed: transcript } })
        }
      >
        <Text style={styles.buttonLabel}>Open Voice Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    padding: 20,
    marginTop: 32,
  },
  badge: {
    width: 12,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    marginRight: 16,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 6,
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    marginTop: 10,
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginLeft: 12,
  },
  buttonLabel: {
    color: Colors.white,
    fontWeight: '600',
  },
});
