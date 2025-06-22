import { FontAwesome } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PulseWave from '../components/PulseWave';
import Colors from '../constants/Colors';
import { saveTranscript } from '../store/historyStorage';

const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height



export default function Recorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const player = useAudioPlayer(recordedUri ?? undefined);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { language, model, isImpaired } = useLocalSearchParams<{ language: string; model: string; isImpaired?: string}>();

console.log('Language:', language);
  console.log('Model:', model);
  console.log('Is Impaired:', isImpaired);

useEffect(() => {
  let interval: NodeJS.Timer | null = null;

  if (isRecording) {
    interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  } else {
    if (interval) clearInterval(interval);
    setRecordingTime(0); // Reset when recording stops
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isRecording]);


  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  

  const startRecording = async () => {
    if (player.isPlaying) await player.stop();
    setRecordedUri(null);
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setIsRecording(false);

    if (!audioRecorder.uri) {
      Alert.alert('No recording found');
      return;
    }

    setRecordedUri(audioRecorder.uri);
  };
  
    const uploadAudio = async (uri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'recording.wav',
    type: 'audio/wav',
  } as any);
  formData.append('language', language);
  formData.append('model', model);
  formData.append('isImpaired', isImpaired);

  const response = await fetch('https://1ddf-197-255-124-84.ngrok-free.app/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed with status ' + response.status);
  }

  return await response.json(); // 👈 important to return the parsed response
};


  const handleTranscription = async () => {
  if (!recordedUri) {
    Alert.alert('No recording found');
    return;
  }

  try {
    setLoading(true);

    const data = await uploadAudio(recordedUri);

    if (!data?.transcription) {
      throw new Error('Transcription missing in response');
    }

    await saveTranscript(data.transcription);

    router.push({
      pathname: '/result',
      params: {
        transcript: data.transcription,
        language,
        model,
      },
    });
  } catch (err) {
    Alert.alert('Transcription Failed', (err as Error).message);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Transcribing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Microphone + Animation */}
      <View style={styles.micWrapper}>
        <PulseWave isRecording={isRecording} />
        <TouchableOpacity
          style={[styles.micButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome name={isRecording ? 'stop' : 'microphone'} size={36} color="#fff" />
        </TouchableOpacity>
      </View>

      {isRecording && (
  <Text style={styles.timerText}>
    ⏱ {Math.floor(recordingTime / 60)
      .toString()
      .padStart(2, '0')}
    :
    {(recordingTime % 60).toString().padStart(2, '0')}
  </Text>
)}


      {/* Play & Replay only after recording */}
      {recordedUri && !isRecording && (
        <View style={styles.playerControls}>
          <View style={styles.align}>
            <TouchableOpacity onPress={() => player.play()} style={styles.playButton}>
            <Text style={styles.playText}>▶ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              player.seekTo(0);
              player.play();
            }}
            style={[styles.playButton, { marginLeft: 10 }]}
          >
            <Text style={styles.playText}>↻ Replay</Text>
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
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding:Height * 0.024,
  },
  micWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Height * 0.016,
  },
  micButton: {
    backgroundColor: Colors.primary,
    width: Width * 0.25,
    height:Height * 0.12,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  statusText: {
    marginTop:Height * 0.20,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  playerControls: {
    marginTop:Height * 0.030,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingVertical:Height * 0.01,
    paddingHorizontal:Width * 0.04,
    borderRadius: 8,
    marginBottom: 16,
  },
  playText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transcribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical:Height * 0.012,
    paddingHorizontal:Width * 0.05,
    borderRadius: 10,
  },
  transcribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop:Height * 0.012,
    fontSize: 16,
    color: Colors.primary,
  },
  timerText: {
  marginTop:Height * 0.020,
  fontSize: 28,
  fontWeight: '600',
  color: Colors.primary,
},
align:{
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 40
}

});
