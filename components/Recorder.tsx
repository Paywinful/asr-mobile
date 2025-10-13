import { FontAwesome } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import {
  TRANSCRIPTION_TIMEOUT_MS,
  buildTranscriptionUrl,
} from '../constants/api';
import PulseWave from './PulseWave';
import { saveTranscript } from '../store/historyStorage';

type RecorderProps = {
  language: string;
  model: string;
  isImpaired?: boolean;
  etiology?: string | null;
};

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const resolveMimeType = (uri: string) => {
  const extension = uri.split('.').pop()?.toLowerCase();
  if (extension === 'wav') return 'audio/wav';
  if (extension === 'aac') return 'audio/aac';
  if (extension === 'mp3') return 'audio/mpeg';
  return 'audio/mp4';
};

export default function Recorder({
  language,
  model,
  isImpaired = false,
  etiology,
}: RecorderProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const player = useAudioPlayer(recordedUri ?? undefined);

  const isNonStandard = useMemo(
    () => Boolean(isImpaired && etiology && etiology !== 'null'),
    [etiology, isImpaired],
  );
  const targetModel = useMemo(() => {
    const trimmed = typeof model === 'string' ? model.trim() : '';
    return trimmed.length > 0 ? trimmed : 'default';
  }, [model]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted && !cancelled) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record audio.',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      if (player.isPlaying) {
        await player.stop();
      }
      setRecordedUri(null);
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert(
        'Recording Failed',
        'Unable to start recording. Please try again.',
      );
    }
  }, [audioRecorder, player]);

  const stopRecording = useCallback(async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (!audioRecorder.uri) {
        Alert.alert('Recording Failed', 'No recording was captured.');
        return;
      }

      setRecordedUri(audioRecorder.uri);
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert(
        'Recording Failed',
        'Unable to stop recording. Please try again.',
      );
    }
  }, [audioRecorder]);

  const uploadAudio = useCallback(
    async (uri: string) => {
      const endpoint = buildTranscriptionUrl(targetModel, isNonStandard);
      const fileName = uri.split('/').pop() ?? 'recording.m4a';
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        TRANSCRIPTION_TIMEOUT_MS,
      );

      try {
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: fileName,
          type: resolveMimeType(uri),
        } as any);
        formData.append('language', language);
        formData.append('model', targetModel);
        formData.append('isImpaired', String(isImpaired));
        if (etiology) {
          formData.append('etiology', etiology);
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        return await response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [etiology, isImpaired, isNonStandard, language, targetModel],
  );

  const handleTranscription = useCallback(async () => {
    if (!recordedUri) {
      Alert.alert(
        'Recording Missing',
        'Please record audio before requesting a transcription.',
      );
      return;
    }

    try {
      setLoading(true);
      const data = await uploadAudio(recordedUri);

      if (!data?.transcription) {
        throw new Error('Transcription missing in response.');
      }

      await saveTranscript(data.transcription);

      router.replace({
        pathname: '/result',
        params: {
          transcript: data.transcription,
          language,
          model: targetModel,
          audioUri: recordedUri,
          isImpaired: String(isImpaired),
          etiology: etiology ?? '',
        },
      });
    } catch (error) {
      console.error('Transcription failed', error);
      const message =
        error instanceof Error
          ? error.name === 'AbortError'
            ? 'The transcription request timed out. Please try again.'
            : error.message
          : 'An unexpected error occurred.';
      Alert.alert('Transcription Failed', message);
    } finally {
      setLoading(false);
    }
  }, [etiology, isImpaired, language, recordedUri, targetModel, uploadAudio]);

  const handlePlay = useCallback(async () => {
    if (!recordedUri) {
      return;
    }

    try {
      await player.play();
    } catch (error) {
      console.error('Playback failed', error);
      Alert.alert('Playback Failed', 'Unable to play the recording.');
    }
  }, [player, recordedUri]);

  const handleReplay = useCallback(async () => {
    if (!recordedUri) {
      return;
    }

    try {
      await player.seekTo(0);
      await player.play();
    } catch (error) {
      console.error('Replay failed', error);
      Alert.alert('Playback Failed', 'Unable to replay the recording.');
    }
  }, [player, recordedUri]);

  if (!language || !targetModel) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Missing recording configuration. Please return and select your options again.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Transcribing...</Text>
      </View>
    );
  }

  const minutes = Math.floor(recordingTime / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (recordingTime % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.micWrapper}>
        <PulseWave isRecording={isRecording} />
        <TouchableOpacity
          style={styles.micButton}
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome
            name={isRecording ? 'stop' : 'microphone'}
            size={36}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {isRecording && <Text style={styles.timerText}>Timer: {minutes}:{seconds}</Text>}

      {recordedUri && !isRecording && (
        <View style={styles.playerControls}>
          <View style={styles.playRow}>
            <TouchableOpacity onPress={handlePlay} style={styles.playButton}>
              <FontAwesome name="play" size={18} color={Colors.white} />
              <Text style={styles.playText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReplay} style={styles.playButton}>
              <FontAwesome name="undo" size={18} color={Colors.white} />
              <Text style={styles.playText}>Replay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleTranscription}
            style={styles.transcribeButton}
          >
            <Text style={styles.transcribeText}>Transcribe</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Height * 0.024,
  },
  micWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Height * 0.016,
  },
  micButton: {
    backgroundColor: Colors.primary,
    width: Width * 0.25,
    height: Width * 0.25,
    borderRadius: Width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  playerControls: {
    marginTop: Height * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playRow: {
    flexDirection: 'row',
    marginBottom: Height * 0.02,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Height * 0.01,
    paddingHorizontal: Width * 0.04,
    borderRadius: 8,
    marginHorizontal: Width * 0.01,
  },
  playText: {
    color: Colors.white,
    fontSize: Height * 0.025,
    fontWeight: '600',
    marginLeft: 8,
  },
  transcribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Height * 0.012,
    paddingHorizontal: Width * 0.05,
    borderRadius: 10,
  },
  transcribeText: {
    color: Colors.white,
    fontSize: Height * 0.038,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Width * 0.1,
  },
  loadingText: {
    marginTop: Height * 0.012,
    fontSize: Height * 0.025,
    color: Colors.primary,
    textAlign: 'center',
  },
  timerText: {
    marginTop: Height * 0.02,
    fontSize: Height * 0.03,
    fontWeight: '600',
    color: Colors.primary,
  },
});
