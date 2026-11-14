export const DEFAULT_VOCAB_SIZE = 131072;
export const DEFAULT_CONTEXT_WINDOW = 32768;

export function computePrefillChunk(maxBinding, intermediateSize, activationType) {
  const bytesPerValue = activationType === 'float16' ? 2 : 4;
  const activationBytes = Number(intermediateSize || 0) * bytesPerValue;
  if (!activationBytes || !Number.isFinite(maxBinding) || maxBinding <= 0) return Infinity;
  return Math.max(256, Math.floor(maxBinding / activationBytes / 256) * 256);
}

export function resolveContextWindow(meta = {}) {
  const value = Number(meta.max_position ?? meta.max_position_embeddings ?? DEFAULT_CONTEXT_WINDOW);
  return Math.min(Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTEXT_WINDOW, DEFAULT_CONTEXT_WINDOW);
}
