import { FontAwesome } from '@expo/vector-icons';
import { AudioModule, useAudioPlayer, type AudioMode } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TtsSection from '../components/TtsSection';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const buildPlaybackAudioMode = (): Partial<AudioMode> => ({
  allowsRecording: false,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  ...(Platform.OS === 'ios'
    ? { interruptionMode: 'mixWithOthers' as const }
    : { interruptionModeAndroid: 'duckOthers' as const }),
});

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    transcript?: string | string[];
    audioUri?: string | string[];
    language?: string | string[];
    model?: string | string[];
    etiology?: string | string[];
    isImpaired?: string | string[];
  }>();

  const transcript =
    typeof params.transcript === 'string' ? params.transcript : '';
  const audioUri =
    typeof params.audioUri === 'string' && params.audioUri.length > 0
      ? params.audioUri
      : undefined;
  const language =
    typeof params.language === 'string' && params.language.length > 0
      ? params.language
      : 'N/A';
  const model =
    typeof params.model === 'string' && params.model.length > 0
      ? params.model
      : 'N/A';
  const etiology =
    typeof params.etiology === 'string' && params.etiology.length > 0
      ? params.etiology
      : undefined;
  const isImpaired =
    typeof params.isImpaired === 'string' ? params.isImpaired : 'false';

  const player = useAudioPlayer(audioUri ?? undefined);

  useEffect(() => {
    if (!audioUri) {
      console.warn('Result screen opened without audio URI.');
    }
  }, [audioUri]);

  const openQuestionnaire = () => {
    Linking.openURL('https://forms.gle/oywwrBt5yU9frsjC6').catch(() => {
      Alert.alert('Unable to open form', 'Please try again later.');
    });
  };

  const handlePlay = async () => {
    if (!audioUri) {
      Alert.alert('Playback Unavailable', 'No audio was provided.');
      return;
    }

    try {
      await AudioModule.setAudioModeAsync(buildPlaybackAudioMode());
      await player.play();
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Playback Failed', 'Unable to play the audio.');
    }
  };

  const handleReplay = async () => {
    if (!audioUri) {
      Alert.alert('Playback Unavailable', 'No audio was provided.');
      return;
    }

    try {
      await AudioModule.setAudioModeAsync(buildPlaybackAudioMode());
      await player.seekTo(0);
      await player.play();
    } catch (error) {
      console.error('Replay error:', error);
      Alert.alert('Replay Failed', 'Unable to replay the audio.');
    }
  };

  const handleRecordAnother = () => {
    router.replace({
      pathname: '/record',
      params: {
        language,
        model,
        isImpaired,
        ...(audioUri ? { audioUri } : {}),
        ...(etiology ? { etiology } : {}),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.overline}>Transcription ready</Text>
        <Text style={styles.transcript}>{transcript}</Text>

        <View style={styles.metadata}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipLabel}>{language}</Text>
          </View>
          {/* <View style={styles.metaChip}>
            <Text style={styles.metaChipLabel}>{model}</Text>
          </View> */}
          {etiology ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipLabel}>Etiology: {etiology}</Text>
            </View>
          ) : null}
        </View>

        {audioUri ? (
          <View style={styles.audioControls}>
            <TouchableOpacity
              onPress={handlePlay}
              style={[styles.audioBtn, styles.audioBtnPrimary]}
            >
              <FontAwesome name="play" size={16} color={Colors.white} />
              <Text style={styles.audioBtnLabel}>Play back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReplay}
              style={[styles.audioBtn, styles.audioBtnSecondary]}
            >
              <FontAwesome name="undo" size={16} color={Colors.text} />
              <Text style={[styles.audioBtnLabel, styles.audioBtnLabelAlt]}>
                Restart
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.audioNotice}>
            No audio was attached to this transcription.
          </Text>
        )}
      </View>

      <TtsSection transcript={transcript} />

      <TouchableOpacity
        style={styles.primaryAction}
        onPress={handleRecordAnother}
      >
        <Text style={styles.primaryActionLabel}>Record another sample</Text>
      </TouchableOpacity>

      <View style={styles.footerActions}>
        <TouchableOpacity onPress={openQuestionnaire}>
          <Text style={styles.linkText}>Share quick feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/history')}>
          <Text style={styles.linkText}>Browse history</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  overline: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  transcript: {
    color: Colors.text,
    fontSize: Height * 0.032,
    lineHeight: 28,
    marginTop: 18,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  metaChip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  metaChipLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  audioControls: {
    flexDirection: 'row',
    marginTop: 18,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginRight: 12,
  },
  audioBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  audioBtnSecondary: {
    backgroundColor: Colors.surfaceAlt,
  },
  audioBtnLabel: {
    marginLeft: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  audioBtnLabelAlt: {
    color: Colors.text,
  },
  audioNotice: {
    marginTop: 18,
    color: Colors.textSecondary,
  },
  primaryAction: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryActionLabel: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  footerActions: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: Colors.accent,
    fontWeight: '600',
  },
});

