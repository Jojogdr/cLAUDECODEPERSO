// Word-level transcription with Whisper base (ONNX, weights shipped in the npm package
// `sts-whisper-base`, so no Hugging Face download is needed).
// usage: node scripts/transcribe.mjs <audio-or-video> [language=french] > words.json
// Output: [{"w": "Aujourd'hui,", "s": 0.42, "e": 0.76}, ...] — snap starts to onsets afterwards (align.py).
import {pipeline, env} from '@huggingface/transformers';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
env.localModelPath = path.join(root, 'node_modules/sts-whisper-base/models/');
env.allowRemoteModels = false;

const [, , input, language = 'french'] = process.argv;
if (!input) { console.error('usage: node scripts/transcribe.mjs <file> [language]'); process.exit(1); }
const raw = execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', input, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], {maxBuffer: 1 << 30});
const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {dtype: 'q8'});
const r = await asr(audio, {chunk_length_s: 30, stride_length_s: 5, return_timestamps: 'word', language, task: 'transcribe'});
// merge Whisper sub-tokens ("Aujourd" + "'hui") into words
const out = [];
for (const c of r.chunks) {
  const w = c.text.trim();
  const [s, e] = c.timestamp;
  if (out.length && /^['-]/.test(w)) { out[out.length - 1].w += w; out[out.length - 1].e = e ?? out[out.length - 1].e; }
  else out.push({w, s, e: e ?? s + 0.3});
}
console.error(r.text);
console.log(JSON.stringify(out));
