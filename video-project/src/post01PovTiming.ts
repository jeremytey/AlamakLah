// Post 01 POV "POV: your friend that never pays you back" - single source of truth for timing.
// All frames are ABSOLUTE composition frames at 30 fps. Format: POV (fiction, comedy).
// All debt values are FICTION.
//
// VOICE SYNC r3 (2026-11-16): video-project/public/audio/post-01-pov.m4a (Kokoro-82M, narrator am_michael,
// friend am_fenrir on lines 2-4 at -5.3 dB, trimmed, 29.354 s). Line onsets are the ends of the 7 pauses
// >= 0.55 s found with FFmpeg silencedetect (-40 dB) on production/audio-raw/post-01-pov-kokoro-r3-leveled.wav;
// line 1 starts at the first audible sample. Caption word frames come from whisper.cpp 1.5.5 (small.en)
// token timestamps (production/audio-raw/post-01-pov-whisper-raw-r3.json); caption TEXT is the script.
// To re-time: edit LINE_ONSETS_S / SPEECH_END_S and the word `at` values; everything else is derived.

export const FPS = 30;

export const LINE_ONSETS_S = [0.05, 3.986958, 5.761542, 7.961333, 10.317458, 15.420458, 19.866167, 26.117042];
export const SPEECH_END_S = 29.304; // last sample above -40 dBFS (end of "bank")
const LINE = LINE_ONSETS_S.map((s) => Math.floor(s * FPS));

// End caption: starts when the last spoken word ends and stays to the final frame.
export const END_CAPTION_FRAMES = 84; // >= 2.8 s
export const END_CAPTION_AT = Math.ceil(SPEECH_END_S * FPS);
export const DURATION_IN_FRAMES = END_CAPTION_AT + END_CAPTION_FRAMES;

export type SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
export type SceneTiming = { id: SceneId; start: number; end: number };

// Each scene starts on its first spoken line (S1 starts at frame 0, line 1 at 0.05 s).
export const SCENES: Record<SceneId, SceneTiming> = {
  s1: { id: "s1", start: 0, end: LINE[1] }, // THE INTRO, line 1
  s2: { id: "s2", start: LINE[1], end: LINE[4] }, // THE EXCUSES, lines 2-4
  s3: { id: "s3", start: LINE[4], end: LINE[5] }, // THE SPONSOR, line 5
  s4: { id: "s4", start: LINE[5], end: LINE[6] }, // THE DISCOVERY, line 6
  s5: { id: "s5", start: LINE[6], end: LINE[7] }, // THE REALISATION, line 7
  s6: { id: "s6", start: LINE[7], end: DURATION_IN_FRAMES }, // THE PAYOFF, line 8 + end caption
};
export const SCENE_ORDER: SceneId[] = ["s1", "s2", "s3", "s4", "s5", "s6"];

// S2: three dinners, same camera and set; only the food changes. One excuse line each.
export const DINNERS: { start: number; end: number; label: string; food: string; side: string }[] = [
  { start: LINE[1], end: LINE[2], label: "DINNER 1", food: "#f4f1e8", side: "#e0393e" }, // rice + sambal
  { start: LINE[2], end: LINE[3], label: "DINNER 2", food: "#e8a54b", side: "#8fd1a6" }, // fried noodles
  { start: LINE[3], end: LINE[4], label: "DINNER 3", food: "#e3c088", side: "#c98f62" }, // flatbread + curry
];

// S3: four equal payment beats filling the scene. Debt values are FICTION and editable here.
export type PayItem = "note" | "card" | "phone";
const SPONSOR_ITEMS: { item: PayItem; debt: string }[] = [
  { item: "note", debt: "RM 60" },
  { item: "card", debt: "RM 80" },
  { item: "phone", debt: "RM 100" },
  { item: "note", debt: "RM 100" },
];
export const SPONSOR_BEAT_LEN = Math.floor((SCENES.s3.end - SCENES.s3.start) / SPONSOR_ITEMS.length);
export const SPONSOR_BEATS: { start: number; item: PayItem; debt: string }[] = SPONSOR_ITEMS.map((b, i) => ({
  start: SCENES.s3.start + i * SPONSOR_BEAT_LEN,
  ...b,
}));

// DEBT counter: consecutive equal values merge into one segment (no re-pop).
const counterFromBeats = () => {
  const out: { from: number; to: number; value: string }[] = [];
  SPONSOR_BEATS.forEach((b, i) => {
    const to = i + 1 < SPONSOR_BEATS.length ? SPONSOR_BEATS[i + 1].start : SCENES.s3.end;
    const last = out[out.length - 1];
    if (last && last.value === b.debt) last.to = to;
    else out.push({ from: b.start, to, value: b.debt });
  });
  return out;
};
export const S6_DEBT = "RM 100";
export const COUNTER: { from: number; to: number; value: string }[] = [
  ...counterFromBeats(),
  { from: SCENES.s6.start + 10, to: SCENES.s6.end, value: S6_DEBT },
];

// Captions
export type TimedWord = { text: string; at: number; emphasis?: boolean };
export type CaptionPage = { start: number; end: number; words: TimedWord[] };
const w = (text: string, at: number, emphasis = false): TimedWord => ({ text, at, emphasis });

const PAGES: TimedWord[][] = [
  // S1 (line 1, narrator)
  [w("You", 2), w("know", 5), w("that", 13), w("one", 20), w("friend", 29)],
  [w("who", 36), w("ALWAYS", 43, true), w("says", 56)],
  [w("he'll", 67), w("pay", 76), w("you", 83), w("back", 91), w("later?", 99, true)],
  // S2 DINNER 1 (line 2, friend)
  [w("Bro,", 121), w("TNG", 133, true), w("broken.", 152, true)],
  // S2 DINNER 2 (line 3, friend)
  [w("No", 173, true), w("cash.", 177, true), w("Tomorrow", 191), w("I", 209), w("transfer.", 213)],
  // S2 DINNER 3 (line 4, friend)
  [w("After", 239), w("next", 250, true), w("month's", 260, true), w("salary", 275, true), w("comes.", 279)],
  // S3 (line 5)
  [w("Dinner", 311), w("after", 324), w("dinner.", 335)],
  [w("At", 356), w("this", 361), w("point,", 368), w("you're", 382), w("basically", 395)],
  [w("sponsoring", 416, true), w("his", 438, true), w("food.", 442, true)],
  // S4 (line 6)
  [w("Then", 464), w("one", 470), w("night,", 476)],
  [w("you", 496), w("check", 500), w("his", 508), w("Instagram", 512, true), w("stories...", 531, true)],
  // S5 (line 7)
  [w("He", 596), w("can", 600), w("afford", 607), w("a", 613), w("new", 619, true), w("watch", 629, true)],
  [w("and", 640), w("overseas", 648, true), w("holidays,", 671, true)],
  [w("but", 695), w("he", 701), w("can't", 706), w("pay", 718), w("back", 725), w("RM100.", 734, true)],
  // S6 (line 8)
  [w("You're", 784), w("not", 793), w("his", 801), w("friend", 805), w("anymore.", 815)],
  [w("You're", 836), w("his", 845), w("interest-free", 850, true), w("bank.", 872, true)],
  // End caption (not spoken): on screen from END_CAPTION_AT to the final frame
  [
    w("Tag", END_CAPTION_AT),
    w("the", END_CAPTION_AT + 5),
    w("friend", END_CAPTION_AT + 10),
    w("who", END_CAPTION_AT + 17),
    w("owes", END_CAPTION_AT + 23, true),
    w("you.", END_CAPTION_AT + 29, true),
  ],
];

// A word starts its fade-in CAPTION_LEAD frames before `at`, so it is visible on frame `at`.
export const CAPTION_LEAD = 2;
// Derived: a page stays up until the next page's first word (no blank gaps).
export const CAPTIONS: CaptionPage[] = PAGES.map((words, i) => ({
  start: words[0].at,
  end: i + 1 < PAGES.length ? PAGES[i + 1][0].at : DURATION_IN_FRAMES,
  words,
}));

// Frame of a caption word (first match at or after `from`); used to tie visuals to the voice.
const wordAt = (text: string, from = 0): number => {
  for (const page of PAGES) for (const x of page) if (x.text === text && x.at >= from) return x.at;
  throw new Error(`post01PovTiming: caption word not found: ${text}`);
};

// S4/S5 phone stories. Card order: 0 watch, 1 airport, 2 holiday.
const S4_LEN = SCENES.s4.end - SCENES.s4.start;
const SWIPE = 10; // frames per swipe in S4
const PHONE_ZOOM_END = SCENES.s5.start + 16;
const BANNER_IN_PHONE_AT = wordAt("but", SCENES.s5.start); // drops at the start of "but"
const BACK_START = Math.max(BANNER_IN_PHONE_AT + 45, wordAt("RM100.", SCENES.s5.start) + 6);
export const PHONE = {
  inAt: SCENES.s4.start + 10, // S4 phone overlay slides in
  zoomStart: SCENES.s5.start, // S5 zoom to full screen
  zoomEnd: PHONE_ZOOM_END,
  backStart: BACK_START, // brief cut back to you
  backEnd: BACK_START + 12,
};
// Keyframes for the visible card index (fractional = mid-swipe).
const S4_SWIPE_1 = SCENES.s4.start + Math.round(S4_LEN * 0.38);
const S4_SWIPE_2 = SCENES.s4.start + Math.round(S4_LEN * 0.69);
const S5_WATCH_AT = wordAt("new", SCENES.s5.start); // swipe back to the watch ends on "new"
const S5_HOLIDAY_AT = wordAt("overseas", SCENES.s5.start); // "overseas holidays"
export const STORY_KEYS: { at: number; pos: number }[] = [
  { at: SCENES.s4.start, pos: 0 },
  { at: S4_SWIPE_1, pos: 0 },
  { at: S4_SWIPE_1 + SWIPE, pos: 1 },
  { at: S4_SWIPE_2, pos: 1 },
  { at: S4_SWIPE_2 + SWIPE, pos: 2 },
  // S5: back to the watch for "new watch", then to the holiday for "overseas holidays"
  { at: Math.min(PHONE_ZOOM_END, S5_WATCH_AT - SWIPE), pos: 2 }, // may overlap the end of the zoom
  { at: S5_WATCH_AT, pos: 0 },
  { at: S5_HOLIDAY_AT - 14, pos: 0 },
  { at: S5_HOLIDAY_AT, pos: 2 },
];
export const BANNERS: { at: number; sender: string; text: string; inPhone: boolean }[] = [
  { at: BANNER_IN_PHONE_AT, sender: "Friend", text: "Bro, tomorrow dinner? You belanja first ah, later I pay.", inPhone: true },
  { at: SCENES.s6.start + 58, sender: "Friend", text: "Trust me bro, later.", inPhone: false },
];

// Transitions (overlay fades only).
export const TRANSITIONS: { at: number; half: number; kind: "dipLight" | "dipDark" }[] = [
  { at: SCENES.s4.start, half: 18, kind: "dipDark" }, // only transition: fade through dark S3 -> S4
];

// Action offsets (frames after each dinner / beat start). Post01Pov animates from these too.
export const BILL_TRAY_AT = 10;
export const DINNER_PAY_AT = 28; // note lands on the tray
export const DINNER_THUMB_AT = 33; // thumbs-up appears
export const BEAT_PAY_AT = 12;
export const BEAT_THUMB_AT = 10;
export const STARE_HOLD_AT = SCENES.s6.end - 30; // last second: frozen stare

// SFX cue frames for licensed sounds added later. NOTHING is rendered from this list.
export const SFX_CUES = {
  billTray: [BILL_TRAY_AT],
  cash: [...DINNERS.map((d) => d.start + DINNER_PAY_AT), ...SPONSOR_BEATS.map((b) => b.start + BEAT_PAY_AT)],
  thumbsUp: [...DINNERS.map((d) => d.start + DINNER_THUMB_AT), ...SPONSOR_BEATS.map((b) => b.start + BEAT_THUMB_AT)],
  sceneTransition: TRANSITIONS.map((t) => t.at),
  storySwipe: STORY_KEYS.filter((k, i) => i + 1 < STORY_KEYS.length && STORY_KEYS[i + 1].pos !== k.pos).map((k) => k.at),
  notificationPing: BANNERS.map((b) => b.at),
  stareHold: [STARE_HOLD_AT],
};

// Voiceover: played only if this file exists in video-project/public/.
export const AUDIO_FILE = "audio/post-01-pov.m4a";
