export const TRANSCRIPTION_ENDPOINT_STANDARD =
  'https://hcidcsug--ugtts-faster-whisper-akan-std-api.modal.run/transcribe';
export const TRANSCRIPTION_ENDPOINT_NON_STANDARD =
  'https://hcidcsug--ugtts-faster-whisper-akan-nss-api.modal.run/transcribe';

export const TRANSCRIPTION_TIMEOUT_MS = 60000;

// Configure this once the service endpoint is available.
export const TTS_ENDPOINT = '';

export const buildTranscriptionUrl = (
  modelName: string,
  useNonStandard: boolean,
) => {
  const base = useNonStandard
    ? TRANSCRIPTION_ENDPOINT_NON_STANDARD
    : TRANSCRIPTION_ENDPOINT_STANDARD;
  return `${base}?model_name=${encodeURIComponent(modelName)}`;
};
