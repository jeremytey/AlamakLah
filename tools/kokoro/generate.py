"""Generate one 24 kHz mono WAV from a text file with Kokoro-82M, fully local.

Usage (from the project root):
  tools/kokoro/.venv/bin/python tools/kokoro/generate.py \
      --text path/to/line.txt --voice af_heart --out production/audio-raw/out.wav

Options: --voice (default am_michael), --lang a (American) or b (British); by default the language
follows each voice's prefix (a*/b*). --speed 1.0,
--pause 0.5 (seconds of silence inserted between lines of the text file).
A line of the form [pause 1.5] inserts that many seconds of silence instead of the default.
--trim-db -40 strips Kokoro's own silence from the start and end of each line (pauses stay exact).
A line of the form [voice am_fenrir] switches the voice for the following lines, until the next tag.
Caches stay project-local: HF_HOME defaults to tools/kokoro/cache/hf.
The script refuses to run if the spaCy model en_core_web_sm is missing, because misaki would
otherwise download it automatically (that download needs the owner's approval first).
Licence: Kokoro-82M weights and code are Apache-2.0 (huggingface.co/hexgrad/Kokoro-82M).
"""

import argparse
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
# Must be set before huggingface_hub / torch are imported.
os.environ.setdefault("HF_HOME", str(HERE / "cache" / "hf"))
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")  # per the hexgrad/kokoro README (Apple Silicon)

SAMPLE_RATE = 24000  # Kokoro output rate, per the README example (sf.write(..., audio, 24000))
REPO_ID = "hexgrad/Kokoro-82M"
PAUSE_RE = re.compile(r"\[pause\s+([0-9]*\.?[0-9]+)\]", re.IGNORECASE)  # marker line, e.g. [pause 1.5]
VOICE_RE = re.compile(r"\[voice\s+([a-z]{2}_[a-z0-9]+)\]", re.IGNORECASE)  # tag line, e.g. [voice am_fenrir]


def trim_ends(audio, trim_db: float, margin_s: float):
    """Strip Kokoro's own leading/trailing silence from one line (quieter than trim_db dBFS),
    keeping margin_s seconds so word onsets and endings are not clipped."""
    import numpy as np

    threshold = 10 ** (trim_db / 20)
    loud = np.flatnonzero(np.abs(audio) > threshold)
    if loud.size == 0:
        return audio
    margin = int(round(margin_s * SAMPLE_RATE))
    return audio[max(0, loud[0] - margin) : min(len(audio), loud[-1] + 1 + margin)]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--text", required=True, help="UTF-8 text file to speak")
    ap.add_argument("--voice", default="am_michael", help="starting voice, e.g. am_michael (see VOICES.md)")
    ap.add_argument("--out", required=True, help="output .wav path")
    ap.add_argument(
        "--lang", default=None, choices=["a", "b"], help="force a = American / b = British for all voices"
    )
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--pause", type=float, default=0.5, help="seconds of silence between text lines")
    ap.add_argument(
        "--trim-db",
        type=float,
        default=None,
        help="trim each line's leading/trailing audio quieter than this dBFS (e.g. -40); off by default",
    )
    ap.add_argument("--trim-margin", type=float, default=0.05, help="seconds kept around the trimmed speech")
    args = ap.parse_args()

    import spacy

    if not spacy.util.is_package("en_core_web_sm"):
        print(
            "STOP: spaCy model en_core_web_sm is not installed. misaki would download it automatically.\n"
            "Get approval before installing it into tools/kokoro/.venv.",
            file=sys.stderr,
        )
        return 2

    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    text = Path(args.text).read_text(encoding="utf-8").strip()
    if not text:
        print("STOP: input text is empty", file=sys.stderr)
        return 2

    # One pipeline per language (American 'a', British 'b'), sharing one loaded model.
    pipelines = {}

    def pipeline_for(voice: str):
        lang = args.lang or (voice[0].lower() if voice[0].lower() in ("a", "b") else "a")
        if lang not in pipelines:
            shared = next(iter(pipelines.values())).model if pipelines else True
            pipelines[lang] = KPipeline(lang_code=lang, repo_id=REPO_ID, model=shared)
        return pipelines[lang]

    voice = args.voice
    # Each non-empty line is spoken separately. Between two spoken lines goes --pause seconds of
    # silence, unless pause marker lines ("[pause 1.5]") sit between them: then their total is used.
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    silence = lambda sec: np.zeros(int(round(sec * SAMPLE_RATE)), dtype=np.float32)  # noqa: E731
    parts = []
    pending_pause = None  # seconds from marker lines since the last spoken line
    spoken = 0
    for line in lines:
        m = PAUSE_RE.fullmatch(line)
        if m:
            pending_pause = (pending_pause or 0.0) + float(m.group(1))
            continue
        v = VOICE_RE.fullmatch(line)
        if v:
            voice = v.group(1).lower()
            continue
        spoken += 1
        line_chunks = []
        for result in pipeline_for(voice)(line, voice=voice, speed=args.speed):
            if result.audio is not None:
                line_chunks.append(result.audio.detach().cpu().numpy().astype(np.float32))
            print(f"line {spoken} [{voice}] phonemes: {result.phonemes}")
        if not line_chunks:
            print(f"STOP: no audio produced for line {spoken}", file=sys.stderr)
            return 1
        if parts:
            parts.append(silence(args.pause if pending_pause is None else pending_pause))
        pending_pause = None
        line_audio = np.concatenate(line_chunks)
        if args.trim_db is not None:
            line_audio = trim_ends(line_audio, args.trim_db, args.trim_margin)
        parts.append(line_audio)
    if not parts:
        print("STOP: no spoken lines in the input", file=sys.stderr)
        return 1

    audio = np.concatenate(parts)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out, audio, SAMPLE_RATE, subtype="PCM_16")
    print(f"wrote {out} ({len(audio) / SAMPLE_RATE:.2f} s, {SAMPLE_RATE} Hz, mono)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
