# AlamakLah

Workspace for a faceless Malaysian short-video page (Instagram Reels, TikTok, YouTube Shorts). Videos are 25-45s, 1080x1920, 30fps, built in code with Remotion + Three.js (`@remotion/three`) in a blocky 3D style.

Project rules for Claude Code live in `CLAUDE.md`. Read it first.

## Folder map

| Path | What goes here |
|---|---|
| `CLAUDE.md` | Project context and rules for Claude Code |
| `brand/brand-guide.md` | Tone, visual style, palette, caption style, voice |
| `brand/characters/` | Character descriptions and reference stills |
| `brand/references/` | Reference frames used for acceptance checks |
| `research/competitors/` | Competitor analyses (structure only, never copy) |
| `research/audience-insights/` | Notes on real problems people describe in comments |
| `research/topic-research/` | Sources for WHY videos |
| `content/ideas/idea-database.csv` | Idea backlog |
| `content/scripts/` | One script per post: `post-NN-slug.md` |
| `content/storyboards/` | One storyboard per post: `post-NN-slug.md` |
| `content/published/` | Final caption, hashtags, links per published post |
| `production/workflow.md` | 12-step workflow with time targets |
| `production/preflight-checklist.md` | Checks before each render/publish |
| `production/templates/` | Idea, script, storyboard, competitor templates |
| `production/audio-raw/` | Raw voice recordings (not committed) |
| `production/assets/licence-log.md` | Licence record for every third-party asset |
| `video-project/` | The Remotion project |
| `exports/drafts/`, `exports/final/` | Rendered videos and stills (not committed) |
| `analytics/performance-tracker.csv` | Per-post performance numbers |

## Starting a new video

1. Pick one idea from `content/ideas/idea-database.csv` and set its status to `scripting`.
2. Choose the post number `NN` (two digits) and a short `slug`, e.g. `post-01-repay-instantly`.
3. Copy the templates:
   ```bash
   cp production/templates/script-template.md content/scripts/post-NN-slug.md
   cp production/templates/storyboard-template.md content/storyboards/post-NN-slug.md
   ```
4. Follow `production/workflow.md` and log the actual time per step.
5. Run `production/preflight-checklist.md` before the final render.

## Remotion Studio and rendering

TBD. These commands are added only after they have been verified against the installed Remotion version (Phase C).
