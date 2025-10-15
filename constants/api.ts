export const TRANSCRIPTION_ENDPOINT_STANDARD =
  'https://hcidcsug--ugtts-faster-whisper-akan-std-api.modal.run/transcribe';
export const TRANSCRIPTION_ENDPOINT_NON_STANDARD =
  'https://hcidcsug--ugtts-faster-whisper-akan-nss-api.modal.run/transcribe';
export const TRANSCRIPTION_ENDPOINT_LONG_PHRASES =
  'https://hcidcsug--ugtts-wav2vec-akan-api.modal.run/transcribe';

export const TRANSCRIPTION_TIMEOUT_MS = 60000;

// Configure this once the service endpoint is available.
export const TTS_ENDPOINT = 'https://hcidcsug--ugtts-vits-twi-akan-api.modal.run/';

export const buildTranscriptionUrl = (
  modelName: string,
  useNonStandard: boolean,
) => {
  const base = useNonStandard
    ? TRANSCRIPTION_ENDPOINT_NON_STANDARD
    : modelName === 'wav2vec2-bert-akan-ugspeechdata-v2'
    ? TRANSCRIPTION_ENDPOINT_LONG_PHRASES
    : TRANSCRIPTION_ENDPOINT_STANDARD;
  console.log(`${base}?model_name=${encodeURIComponent(modelName)}`);
  return `${base}?model_name=${encodeURIComponent(modelName)}`;
};
