export const TRANSCRIPTION_ENDPOINT_WHISPER =
  'https://whisper-service-194975005212.europe-west4.run.app/transcribe';
export const TRANSCRIPTION_ENDPOINT_WAV2VEC =
  'https://wav2vec-service-194975005212.europe-west4.run.app/transcribe';

export const TRANSCRIPTION_TIMEOUT_MS = 60000;

// Configure this once the service endpoint is available.
export const TTS_ENDPOINT = 'https://hcidcsug--ugtts-vits-twi-akan-api.modal.run/';

export const buildTranscriptionUrl = (modelName: string) => {
  const normalized = modelName?.toLowerCase() ?? '';
  return normalized.includes('wav2vec')
    ? TRANSCRIPTION_ENDPOINT_WAV2VEC
    : TRANSCRIPTION_ENDPOINT_WHISPER;
};
