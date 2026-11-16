// Post 01 "What if you never paid your friend back?" - single source of truth for timing.
// All frames are ABSOLUTE composition frames at 30 fps.
// Initial values derived from the "Est. sec" column in content/scripts/post-01-never-paid-back.md.
// When the voiceover exists: move scene boundaries and each word's `at` to match the audio.
// All counter values are FICTION.

export const FPS = 30;

export type SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";

export type SceneTiming = {
  id: SceneId;
  start: number; // first frame of the scene
  end: number; // exclusive
  timeLabel?: string;
};

// Beat 1-7 map to scenes 1-7. Beat 8 is a caption-only end card inside scene 7.
export const SCENES: Record<SceneId, SceneTiming> = {
  s1: { id: "s1", start: 0, end: 90 }, // 0-3 s
  s2: { id: "s2", start: 90, end: 210, timeLabel: "DAY 1" }, // 3-7 s
  s3: { id: "s3", start: 210, end: 315, timeLabel: "WEEK 1" }, // 7-10.5 s
  s4: { id: "s4", start: 315, end: 480, timeLabel: "MONTH 3" }, // 10.5-16 s
  s5: { id: "s5", start: 480, end: 660, timeLabel: "YEAR 1" }, // 16-22 s
  s6: { id: "s6", start: 660, end: 780, timeLabel: "YEAR 5" }, // 22-26 s
  s7: { id: "s7", start: 780, end: 990 }, // 26-33 s (beat 7 + beat 8 end card)
};

export const SCENE_ORDER: SceneId[] = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

export const DURATION_IN_FRAMES = SCENES.s7.end;

// Anvil impact in scene 6 (drives the camera shake, the flatten and the "ALAMAK!" pop-up).
export const ANVIL_IMPACT = SCENES.s6.start + 72;

// DEBT counter (FICTION). One entry = one pop-in; it stays on screen without re-popping.
export const COUNTER: { from: number; to: number; value: string }[] = [
  { from: SCENES.s2.start, to: SCENES.s4.end, value: "RM 20" },
  { from: SCENES.s5.start, to: SCENES.s5.end, value: "RM 1,340" },
  { from: SCENES.s6.start, to: SCENES.s7.end, value: "RM 9,999,999" },
];

export type TimedWord = { text: string; at: number; emphasis?: boolean };
// A caption page is shown from `start` until `end`; words appear at `at`.
export type CaptionPage = { start: number; end: number; words: TimedWord[] };

const w = (text: string, at: number, emphasis = false): TimedWord => ({ text, at, emphasis });

// Each page = the words of one caption line, with their start frames. Edit only the `at` values.
const PAGES: TimedWord[][] = [
  // Beat 1 - Hook
  [
    w("What", 4),
    w("if", 11),
    w("you", 18),
    w("never", 25, true),
    w("paid", 32),
    w("your", 39),
    w("friend", 46),
    w("back?", 53, true),
  ],
  // Beat 2 - Rule
  [w("Day", 96), w("one.", 104), w("You", 116), w("owe", 124), w("him", 131), w("RM20.", 138, true)],
  [w("He", 156), w("says", 163), w("no", 172, true), w("rush.", 180, true)],
  // Beat 3 - Consequence
  [w("Week", 216), w("one.", 224), w("Still", 236), w("smiling.", 244, true)],
  [w("Bit", 268), w("too", 278), w("smiling.", 288, true)],
  // Beat 4 - Escalation (wedding)
  [w("Month", 321), w("three.", 330), w("He", 345), w("brings", 353), w("it", 361), w("up", 368)],
  [w("at", 388), w("your", 395), w("cousin's", 403), w("wedding.", 413, true)],
  [w("On", 444), w("the", 451), w("mic.", 458, true)],
  // Beat 5 - Escalation (invoice)
  [w("Year", 486), w("one.", 495), w("He", 508), w("sends", 516), w("a", 524), w("bill.", 530)],
  [w("With", 563), w("interest.", 572, true)],
  [w("And", 604), w("emotional", 612, true), w("damage.", 626, true)],
  // Beat 6 - Escalation (anvil)
  [w("Year", 666), w("five.", 675), w("He", 690), w("finally", 698), w("collects.", 710, true)],
  // Beat 7 - Payoff
  [w("You're", 786), w("gone.", 796)],
  [w("The", 834), w("debt", 842, true), w("is", 852), w("not.", 860)],
  // Beat 8 - End card (caption only, over scene 7)
  [w("How", 891), w("long", 898), w("has", 905), w("someone", 912), w("owed", 922, true), w("you?", 930, true)],
];

// A word starts its fade-in CAPTION_LEAD frames before `at`, so it is already visible on frame `at`.
export const CAPTION_LEAD = 2;

// Derived, never edited by hand: a page starts on its first word's frame and stays up until the
// next page's first word, so there is never a blank caption between pages.
export const CAPTIONS: CaptionPage[] = PAGES.map((words, i) => ({
  start: words[0].at,
  end: i + 1 < PAGES.length ? PAGES[i + 1][0].at : DURATION_IN_FRAMES,
  words,
}));

// Pop-up captions (same font and outline as Caption, larger, mid-screen).
export const POPUPS: { text: string; from: number; to: number }[] = [
  { text: "ALAMAK!", from: ANVIL_IMPACT + 1, to: SCENES.s6.end },
];

// Voiceover: played only if this file exists in video-project/public/.
export const AUDIO_FILE = "audio/post-01.m4a";
