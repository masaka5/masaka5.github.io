export const ASR_BASE='https://huggingface.co/csukuangfj/sherpa-onnx-funasr-nano-int8-2025-12-30/resolve/6f16bd378457e13f36ccf3910df9017f96c346fb';
export const ASR_FILES=[['embedding.int8.onnx',155584380],['encoder_adaptor.int8.onnx',237792748],['llm.int8.onnx',600356593],['Qwen3-0.6B/tokenizer.json',11422654],['Qwen3-0.6B/vocab.json',2776833],['Qwen3-0.6B/merges.txt',1671853]];
export const LITE_BASE='https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/2365baeacb507f821a0c8120fcee3d484dba7a07';
export const LITE_FILES=[['model.int8.onnx',239233841],['tokens.txt',315894]];
export const DIARIZATION_FILES=[['segmentation.onnx','https://huggingface.co/csukuangfj/sherpa-onnx-pyannote-segmentation-3-0/resolve/9403a6902bb58e3d5ae8c7e77c3422de279db2e0/model.int8.onnx',1540506],['campplus.onnx',new URL('./vendor/campplus.onnx',import.meta.url).href,28281164]];
