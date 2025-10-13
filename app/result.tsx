import { FontAwesome } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TtsSection from '../components/TtsSection';
import Colors from '../constants/Colors';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

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
    <View style={styles.container}>
      <Text style={styles.title}>Transcription</Text>
      <Text style={styles.transcript}>{transcript}</Text>

      <View style={styles.metadata}>
        <Text style={styles.metaText}>Language: {language}</Text>
        <Text style={styles.metaText}>Model: {model}</Text>
        {etiology ? (
          <Text style={styles.metaText}>Etiology: {etiology}</Text>
        ) : null}
      </View>

      {audioUri && (
        <View style={styles.audioControls}>
          <TouchableOpacity onPress={handlePlay} style={styles.playButton}>
            <FontAwesome name="play" size={16} color={Colors.white} />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReplay} style={styles.playButton}>
            <FontAwesome name="undo" size={16} color={Colors.white} />
            <Text style={styles.playText}>Replay</Text>
          </TouchableOpacity>
        </View>
      )}

      <TtsSection transcript={transcript} />

      <TouchableOpacity style={styles.button} onPress={handleRecordAnother}>
        <Text style={styles.buttonText}>Record Another</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openQuestionnaire}>
        <Text style={styles.questionnaire}>
          Tap here to answer some questions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/history')}>
        <Text style={styles.secondary}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Height * 0.03,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  transcript: {
    fontSize: Height * 0.038,
    textAlign: 'center',
    marginBottom: 18,
    color: Colors.text,
  },
  metadata: {
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 16,
    color: '#555',
  },
  audioControls: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  playText: {
    color: Colors.white,
    fontSize: Height * 0.03,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 10,
    width: Width * 0.8,
  },
  buttonText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: Height * 0.03,
  },
  questionnaire: {
    color: Colors.primary,
    fontSize: Height * 0.02,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  secondary: {
    color: Colors.primary,
    fontSize: Height * 0.03,
    marginTop: 20,
  },
});
