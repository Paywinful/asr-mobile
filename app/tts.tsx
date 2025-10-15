import { FontAwesome } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { AudioModule, useAudioPlayer, type AudioMode } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { TTS_ENDPOINT } from '../constants/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audioUri?: string;
  status?: 'loading' | 'ready' | 'error';
};

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

type StackItem = { value: unknown; key?: string };

const findStringDeep = (
  root: unknown,
  predicate: (value: string, key?: string) => boolean,
): string | undefined => {
  const stack: StackItem[] = [{ value: root }];
  const seen = new Set<object>();

  while (stack.length) {
    const { value, key } = stack.pop() as StackItem;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length && predicate(trimmed, key)) {
        return trimmed;
      }
      continue;
    }

    if (value && typeof value === 'object') {
      if (seen.has(value as object)) continue;
      seen.add(value as object);

      if (Array.isArray(value)) {
        for (let i = value.length - 1; i >= 0; i--) {
          stack.push({ value: value[i], key });
        }
      } else {
        Object.entries(value as Record<string, unknown>).forEach(
          ([childKey, childValue]) => {
            stack.push({ value: childValue, key: childKey });
          },
        );
      }
    }
  }

  return undefined;
};

const stripDataUrlPrefix = (input: string) => {
  const idx = input.indexOf('base64,');
  return idx >= 0 ? input.slice(idx + 'base64,'.length) : input;
};

const inferExtension = (base64?: string, fallback?: string) => {
  if (fallback?.trim().length) {
    return fallback.trim().replace(/^\./, '');
  }
  if (base64?.startsWith('data:audio/')) {
    const match = base64.match(/^data:audio\/([^;]+)/i);
    if (match?.[1]) return match[1];
  }
  return 'mp3';
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  if (typeof Buffer !== 'undefined') {
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Buffer.from(uint8).toString('base64');
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis?.btoa ? globalThis.btoa(binary) : '';
};

export default function TtsChatScreen() {
  const { seed } = useLocalSearchParams<{ seed?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Hi there! Type anything and I will respond with natural audio once the TTS service is configured.',
      status: 'ready',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const playbackPlayer = useAudioPlayer(undefined, { downloadFirst: true });
  const endpointConfigured = TTS_ENDPOINT.trim().length > 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 200);
    return () => clearTimeout(timeout);
  }, [messages.length]);

  useEffect(() => {
    if (seed && seed.trim().length > 0) {
      setInput(seed.trim());
    }
  }, [seed]);

  const playAudio = async (uri: string) => {
    try {
      await AudioModule.setAudioModeAsync(buildPlaybackAudioMode());
      playbackPlayer.replace({ uri });
      try {
        await playbackPlayer.seekTo(0);
      } catch {
        // ignore seek errors (player may not support seek)
      }
      playbackPlayer.play();
    } catch (error) {
      console.error('Failed to play audio', error);
      Alert.alert('Playback failed', 'Unable to play the generated audio.');
    }
  };

  const createAudioFile = async (data: any) => {
    if (!data || typeof data !== 'object') return undefined;

    const audioUrl = findStringDeep(
      data,
      (value, key) =>
        Boolean(key?.toLowerCase().includes('audio') || key?.toLowerCase().includes('url')) &&
        (value.startsWith('http') || value.startsWith('data:audio')),
    );
    if (audioUrl) return audioUrl;

    const base64Audio = findStringDeep(
      data,
      (value, key) =>
        Boolean(key?.toLowerCase().includes('audio') || key?.toLowerCase().includes('data')) &&
        !value.startsWith('http'),
    );
    const fallbackBase64 =
      base64Audio ??
      findStringDeep(
        data,
        (value) => value.length > 100 && !value.startsWith('http'),
      );
    if (fallbackBase64) {
      const extension = findStringDeep(
        data,
        (value, key) => Boolean(key && key.toLowerCase().includes('extension')),
      );
      const fileUri = `${FileSystem.cacheDirectory}tts-${Date.now()}.${inferExtension(
        fallbackBase64,
        extension,
      )}`;
      await FileSystem.writeAsStringAsync(fileUri, stripDataUrlPrefix(fallbackBase64), {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileUri;
    }

    return undefined;
  };

  const resolveReplyText = (data: any, fallback: string) => {
    if (!data || typeof data !== 'object') return fallback;

    const text = findStringDeep(
      data,
      (value, key) =>
        Boolean(
          key &&
            (key.toLowerCase().includes('text') ||
              key.toLowerCase().includes('message') ||
              key.toLowerCase().includes('reply')),
        ),
    );

    return text ?? fallback ?? 'Here is your audio response.';
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const messageId = `user-${Date.now()}`;
    const pendingId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: 'user',
        text: trimmed,
        status: 'ready',
      },
      {
        id: pendingId,
        role: 'assistant',
        text: 'Generating audio response…',
        status: endpointConfigured ? 'loading' : 'error',
      },
    ]);
    setInput('');
    setIsSending(true);

    if (!endpointConfigured) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === pendingId
              ? {
                  ...msg,
                  text:
                    'Configure your TTS endpoint in constants/api.ts to enable live audio replies.',
                  status: 'error',
                }
              : msg,
          ),
        );
        setIsSending(false);
      }, 250);
      return;
    }

    try {
      const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          model_type: 'ss',
          speaker: 'PT',
        }),
      });

      const contentType =
        response.headers.get('content-type')?.toLowerCase() ?? '';

      if (!response.ok) {
        const errorBody =
          contentType.includes('application/json')
            ? await response.text().catch(() => '')
            : await response.text().catch(() => '');
        const message =
          errorBody?.trim().length
            ? `Service responded with ${response.status}: ${errorBody}`
            : `Service responded with status ${response.status}`;
        throw new Error(message);
      }

      let data: any = {};

      if (contentType.includes('application/json')) {
        const raw = await response.text();
        if (raw?.trim().length) {
          try {
            data = JSON.parse(raw);
          } catch {
            throw new Error(
              `Unexpected JSON format from service: ${raw.slice(0, 200)}`,
            );
          }
        }
      } else if (contentType.startsWith('audio/')) {
        const audioBuffer = await response.arrayBuffer();
        const base64 = arrayBufferToBase64(audioBuffer);
        if (!base64) {
          throw new Error('Failed to decode audio payload from service.');
        }
        data = {
          audio: `data:${contentType};base64,${base64}`,
          extension: contentType.split('/').pop(),
        };
      } else if (contentType.startsWith('text/')) {
        const raw = await response.text();
        const candidate = raw.replace(/\s+/g, '');
        const looksBase64 =
          candidate.length > 100 && /^[A-Za-z0-9+/=]+$/.test(candidate);
        if (looksBase64) {
          data = { audio: candidate };
        } else {
          throw new Error(
            raw?.trim().length
              ? `Unexpected text response: ${raw}`
              : 'Service returned an empty response.',
          );
        }
      } else {
        // Non-JSON responses are not currently supported.
        throw new Error(
          `Unsupported response content-type: ${contentType || 'unknown'}`,
        );
      }

      // console.debug('TTS response payload', data);

      const audioUri = await createAudioFile(data);
      const replyText = resolveReplyText(
        data,
        'Here is your audio response.',
      );
      const hasAudio = Boolean(audioUri);
      const displayText = hasAudio
        ? replyText
        : `${replyText} (service did not include audio data)`;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? {
                ...msg,
                text: displayText,
                audioUri,
                status: hasAudio ? 'ready' : 'error',
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error('TTS error', error);
      const message =
        error instanceof Error ? error.message : 'Unexpected error occurred.';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? {
                ...msg,
                text: message,
                status: 'error',
              }
            : msg,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {item.text}
        </Text>
        {item.status === 'loading' ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.loaderText}>Preparing audio</Text>
          </View>
        ) : null}
        {!isUser && item.audioUri ? (
          <TouchableOpacity
            style={styles.playChip}
            onPress={() => playAudio(item.audioUri!)}
          >
            <FontAwesome name="play" size={12} color={Colors.white} />
            <Text style={styles.playChipLabel}>Listen</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const disabled = useMemo(
    () => !input.trim().length || isSending,
    [input, isSending],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={14} color={Colors.text} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Chat</Text>
        <Text style={styles.subtitle}>
          Type your message and receive audio replies in seconds.
        </Text>
      </View>

      {!endpointConfigured ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            TTS endpoint not configured. Update constants/api.ts to enable live
            audio synthesis.
          </Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <View style={styles.composer}>
          <TextInput
            placeholder="Send a message…"
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.sendBtn, disabled && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={disabled}
          >
            <FontAwesome
              name="paper-plane"
              size={16}
              color={disabled ? Colors.textSecondary : Colors.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Width * 0.05,
    paddingTop: Height * 0.04,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  backLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: Height * 0.042,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  banner: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  bannerText: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 120,
  },
  messageBubble: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginVertical: 6,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.text,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  loaderText: {
    marginLeft: 8,
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  playChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  playChipLabel: {
    marginLeft: 6,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    maxHeight: 140,
    marginRight: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceAlt,
  },
});
