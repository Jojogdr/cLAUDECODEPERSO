---
name: short-form-edit
description: Use when the user wants a raw talking-head recording (MOV/MP4) transcribed and auto-edited against its script, cutting silences, false starts, and re-recorded takes, with overlapping L-cut transitions. Triggers on "edit my recording", "transcribe and edit", "/short-form-edit <file>".
---

You are editing a raw talking-head recording. The pipeline transcribes the recording with ElevenLabs Scribe, aligns it against the video's script, keeps only the best clean take of each line (cutting silences, flubs, and earlier retakes), and renders with slightly overlapping cuts (L-cut style: the next clip's video starts about 0.25s before the previous clip's audio finishes, crossfading through the silence padding so nothing spoken is lost).

The core idea: the script is the ground truth. Instead of guessing what audio is "good," the tool matches what was actually said against what was supposed to be said, and keeps the best clean take of each line in script order.

## Inputs

- **Recording file** (required): a `.mov` or `.mp4` of you reading your script on camera.
- **Script** (required): the `script.md` (or any text file) of what you meant to say. The spoken narration is pulled from Hook / Context / The Meat / CTA sections; slide cues, visual directions, headers, and tables are ignored.
- **Overlap** (optional): seconds of L-cut overlap per transition. Default `0.25`. Pass `0` for plain hard cuts.

## Run

```
scripts/edit_short.sh "<input recording>" "<script.md>" "<output.mov>" [overlap]
```

- Name the output `<topic>-edited.mov`. Never overwrite the raw recording; for a revision use `-v2`, `-v3`.
- Run with a generous timeout (transcription plus render can take a few minutes). For long recordings, run it in the background.
- The transcript is cached as `elevenlabs-transcription.json` next to the input and reused on later runs (validated against the audio duration), so it never re-transcribes the same file twice.
- `ELEVENLABS_API_KEY` is read from the environment. Set it first: `export ELEVENLABS_API_KEY="..."`. The key is never passed on a command line.

### Transcription and the offline Parakeet fallback

The driver transcribes with ElevenLabs Scribe when a key is set. The moment Scribe is unavailable (free monthly credits used up, or an API error) or no key is set at all, it automatically falls back to **Parakeet** (`parakeet_stt.py`), which runs fully offline and free on Apple Silicon via MLX. Parakeet emits the same word-timestamp shape, so nothing downstream changes. It installs into its own venv (`scripts/parakeet-venv/`) on first fallback. Parakeet is a touch less accurate on brand names, but it keeps the pipeline running at zero cost, so you can run this with no key at all if you want fully free, fully local transcription. Note: the offline fallback needs Apple Silicon; on other platforms, set an ElevenLabs key.
- First run bootstraps its own Python venv (installs `requests` and `numpy`). You also need `ffmpeg` on your PATH.

## Review the diagnostics

`take_edit.py` prints its decisions. Read them before calling it done:

- **`=== FINAL EDIT WILL SAY ===`**: the reconstructed narration of the edit. Confirm it reads coherently start to finish, in script order.
- **`script words with NO take (never spoken cleanly)`**: lines missing from the recording. Skipped bold transition labels are normal; a whole missing beat means you should re-record a pickup.
- **`fuzzy map`**: mis-heard words that were rescued (e.g. `neil->neel`). Sanity-check that no mapping looks wrong. Transcript mishearings of names only affect the text, never the audio.

## Fix-ups (when a cut is wrong)

The driver prints `workdir kept for fix-ups: <path>`, where every intermediate survives.

- To see every take candidate with timestamps: `cd <workdir> && <scripts>/venv/bin/python <scripts>/diag.py narration.txt script`
- Find the offending take in `eleven_keep.json` (keep-ranges are in source-video seconds), adjust or drop it, then re-run `overlap_edit.py <overlap>` and re-render with the same ffmpeg command the driver uses.
- Re-render only; never re-transcribe for a fix-up.

## How the selection works

1. The transcript is split into takes at pauses longer than 0.55s.
2. Mis-heard tokens are fuzzy-mapped into the script vocabulary (length 4+, similarity 0.75+, never number words).
3. Each take is matched to its best contiguous script window (windowed matching; a global longest-common-subsequence would stitch words across different takes).
4. Spelled-out numbers ("seven hundred and forty-four" for "744") count as content and are never trimmed off take edges.
5. A dynamic program picks the highest-coverage monotonic chain of whole takes; a per-take cost kills one-word false-start crumbs; ties go to the later (re-recorded) take.
6. Cuts land only in pauses, snapped to audio zero-crossings, with silence padding kept on both sides. That padding is what the L-cut render crossfades through.

## Tuning knobs (in `take_edit.py`)

- `GAP_SPLIT` 0.55: pause length that splits takes.
- `TAKE_COST` 1.5: raise to drop more one-word false-start crumbs.
- `LEAD` / `TAIL` 0.15 / 0.22: silence padding kept before/after each take.
- Overlap default 0.25 (in `edit_short.sh` / `overlap_edit.py`): L-cut overlap per transition.
