import { FontAwesome } from '@expo/vector-icons';
import type { AudioMode, RecordingOptions } from 'expo-audio';
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';

import type { FileSystemUploadOptions } from 'expo-file-system/legacy';
import {
  FileSystemUploadType,
  createUploadTask,
} from 'expo-file-system/legacy';

import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from '../constants/Colors';
import { TRANSCRIPTION_TIMEOUT_MS, buildTranscriptionUrl } from '../constants/api';
import { saveTranscript } from '../store/historyStorage';
import PulseWave from './PulseWave';

type RecorderProps = {
  language: string;
  model: string;
  isImpaired?: boolean;
  etiology?: string | null;
};

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

// No explicit sample rate/channels: we record with the platform defaults.
// The file is uploaded exactly as produced.
const RECORDING_OPTIONS_NATIVE: RecordingOptions = {
  extension: '.m4a',
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    extension: '.m4a',
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.HIGH,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

const buildAudioModeConfig = (shouldRecord: boolean): Partial<AudioMode> => {
  const common: Partial<AudioMode> = {
    allowsRecording: shouldRecord,
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  };
  if (Platform.OS === 'ios') return { ...common, interruptionMode: 'mixWithOthers' };
  if (Platform.OS === 'android') {
    return {
      ...common,
      shouldRouteThroughEarpiece: false,
      interruptionModeAndroid: shouldRecord ? 'duckOthers' : 'doNotMix',
    };
  }
  return common;
};

const resolveMimeType = (uriOrName: string) => {
  const extension = uriOrName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'wav':  return 'audio/wav';
    case 'aac':  return 'audio/aac';
    case 'mp3':  return 'audio/mpeg';
    case 'm4a':  return 'audio/m4a';
    case 'webm': return 'audio/webm';
    case 'ogg':  return 'audio/ogg';
    case 'mp4':  return 'audio/mp4';
    default:     return 'audio/mp4';
  }
};

export default function Recorder({
  language,
  model,
  isImpaired = false,
  etiology,
}: RecorderProps) {
  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS_NATIVE);
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
    if (model === 'whisper') return isImpaired ? 'gen-lg' : 'lg';
    if (model === 'wav2vec') return 'wav2vec2-bert-akan-ugspeechdata-v2';
    const trimmed = typeof model === 'string' ? model.trim() : '';
    return trimmed.length > 0 ? trimmed : 'lg';
  }, [isImpaired, model]);

  // Permissions & audio session
  useEffect(() => {
    let cancelled = false;
    const configureAudioSession = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          if (!cancelled) Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
          return;
        }
        await AudioModule.setAudioModeAsync(buildAudioModeConfig(true));
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to configure audio for recording', error);
          Alert.alert('Audio Setup Failed', 'Unable to configure audio for recording. Please try again.');
        }
      }
    };
    configureAudioSession();
    return () => {
      cancelled = true;
      AudioModule.setAudioModeAsync(buildAudioModeConfig(false)).catch(() => {});
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!isRecording) { setRecordingTime(0); return; }
    const interval = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      if (player.isPlaying) await player.stop();
      setRecordedUri(null);
      await AudioModule.setAudioModeAsync(buildAudioModeConfig(true));
      await audioRecorder.prepareToRecordAsync(RECORDING_OPTIONS_NATIVE);
      await audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Recording Failed', 'Unable to start recording. Please try again.');
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
      await AudioModule.setAudioModeAsync(buildAudioModeConfig(false));
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Recording Failed', 'Unable to stop recording. Please try again.');
    }
  }, [audioRecorder]);

  /** Upload helper: send the recorded audio as-is */
  const uploadRecording = useCallback(
    async (uri: string) => {
      const endpoint = buildTranscriptionUrl(targetModel, isNonStandard);
      const payloadFields: Record<string, string> = {
        language,
        model: targetModel,
        isImpaired: String(isImpaired),
      };
      if (etiology) payloadFields.etiology = etiology;

      if (Platform.OS === 'web') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS);

        try {
          const response = await fetch(uri);
          const blob = await response.blob();

          // keep original type/name if possible
          const inferredName = uri.split('/').pop() ?? 'recording.webm';
          const mimeType = blob.type || resolveMimeType(inferredName);
          const fileName = inferredName;

          const file = new File([blob], fileName, { type: mimeType });
          const formData = new FormData();
          formData.append('file', file);
          Object.entries(payloadFields).forEach(([key, value]) => {
            formData.append(key, value);
          });

          const uploadResponse = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          });

          if (!uploadResponse.ok) {
            const text = await uploadResponse.text().catch(() => '');
            const details = text ? `: ${text}` : '';
            throw new Error(`Upload failed with status ${uploadResponse.status}${details}`);
          }

          return await uploadResponse.json();
        } catch (err) {
          if ((err as any)?.name === 'AbortError') {
            throw new Error('Transcription request timed out.');
          }
          throw err;
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // Native upload — just send the produced file
      const fileName = uri.split('/').pop() ?? 'recording.m4a';
      const uploadOptions: FileSystemUploadOptions = {
        httpMethod: 'POST',
        uploadType: FileSystemUploadType?.MULTIPART ?? 1,
        fieldName: 'file',
        mimeType: resolveMimeType(fileName),
        headers: { Accept: 'application/json' },
        parameters: payloadFields,
      };

      const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      const uploadTask = createUploadTask(endpoint, normalizedUri, uploadOptions);
      const timeoutId = setTimeout(() => {
        uploadTask.cancelAsync().catch(() => {});
      }, TRANSCRIPTION_TIMEOUT_MS);

      try {
        const result = await uploadTask.uploadAsync();
        if (!result) throw new Error('Upload task failed with no response.');
        if (result.status < 200 || result.status >= 300) {
          const snippet = typeof result.body === 'string' ? result.body.slice(0, 200) : '';
          const details = snippet ? `: ${snippet}` : '';
          throw new Error(`Upload failed with status ${result.status}${details}`);
        }
        return JSON.parse(result.body ?? '{}');
      } catch (err) {
        if ((err as any)?.message?.includes('cancelled')) {
          throw new Error('Transcription request timed out.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [etiology, isImpaired, isNonStandard, language, targetModel],
  );

  /** Transcribe: upload the recorded audio as-is */
  const handleTranscription = useCallback(async () => {
    if (!recordedUri) {
      Alert.alert('Recording Missing', 'Please record audio before requesting a transcription.');
      return;
    }

    try {
      setLoading(true);
      const data = await uploadRecording(recordedUri);
      console.log(data)

      const transcription =
        (data as any)?.transcription ??
        (data as any)?.text ??
        (data as any)?.result;

      if (!transcription) throw new Error('Transcription missing in response.');

      await saveTranscript(transcription);
      router.replace({
        pathname: '/result',
        params: {
          transcript: transcription,
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
  }, [etiology, isImpaired, language, recordedUri, targetModel, uploadRecording]);

  const handlePlay = useCallback(async () => {
    if (!recordedUri) return;
    try {
      await AudioModule.setAudioModeAsync(buildAudioModeConfig(false));
      await player.play();
    } catch (error) {
      console.error('Playback failed', error);
      Alert.alert('Playback Failed', 'Unable to play the recording.');
    }
  }, [player, recordedUri]);

  const handleReplay = useCallback(async () => {
    if (!recordedUri) return;
    try {
      await AudioModule.setAudioModeAsync(buildAudioModeConfig(false));
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

  const minutes = Math.floor(recordingTime / 60).toString().padStart(2, '0');
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
          <FontAwesome name={isRecording ? 'stop' : 'microphone'} size={36} color={Colors.white} />
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

          <TouchableOpacity onPress={handleTranscription} style={styles.transcribeButton}>
            <Text style={styles.transcribeText}>Transcribe</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Height * 0.024,
    borderRadius: 28,
    minHeight: Height * 0.45,
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
    backgroundColor: Colors.secondary,
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
    backgroundColor: Colors.accent,
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
