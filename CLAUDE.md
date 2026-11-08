# AlamakLah: project context for Claude Code

## What this is
Faceless Malaysian short-video page: "Malaysian everyday life, behaviour and curious what-ifs made interesting." Platforms: Instagram Reels, TikTok, YouTube Shorts (same master file). Cadence about 3/week, drop to 2 before cutting quality. Long-term: audience learning for a possible future consumer product. Never force a product into videos. Views and likes are not validated problems.

## Owner
Jeremy, CS student. English-first narration (Malaysian flavour allowed, sparingly). I record my own voice on my phone; you cannot record or generate voice.

## Operating rules
- Be a critical partner: challenge weak hooks, slow scripts and needless complexity. No flattery.
- Label claims VERIFIED (read from an official source this session, page named) / INFERENCE / UNKNOWN. Never invent statistics, prices, regulations, API details, flags or licence terms. If official docs are unreachable, say so; do not claim verification.
- WHY videos: every fact needs a source before scripting. WHAT IF: mark fictional assumptions as fiction.
- Installation policy: inspect first; present ONE consolidated installation plan (purpose, estimated size); install only what I approve; unexpected dependency -> stop and ask; never sudo without explicit approval; never update existing software automatically.
- Never overwrite existing files without asking. Create folders directly in the project root; no nested AlamakLah/.
- Do not add tools, frameworks or features I did not ask for.
- Do not grade your own visual output as a pass. Show stills, list problems honestly; I decide.
- Prevent endless planning. Objective: publish Video 1. Work on ONE video at a time.

## Formats (first 15 posts only)
WHY: Hook -> Recognition -> Explanation -> Escalation -> Payoff
WHAT IF: Hook -> Changed rule -> Consequences -> Escalation -> Payoff

## Production constraints
25-45s, 5-8 scenes, 1080x1920, 30fps, H.264 MP4. One voice, one caption style, one visual style. New scene every 3-5 seconds. No watermark.

## Time limits (separate; none overrides another)
- Environment setup + 3-second technical test: aim 60 min of work (excluding waiting for my replies); test work time and render time reported separately.
- 10-second character spike: separate task, 3-hour hard cap.
- Each regular video: under 3 hours, aim 2 hours.

## Tech stack
Claude Code + Remotion (official plugin/skills if verified) + Three.js via @remotion/three. FFmpeg only if the official docs require it. No AI image generation. No downloaded 3D models, music or SFX unless the licence is logged in production/assets/licence-log.md and I approve. Read the official docs for the INSTALLED Remotion version before changing render/WebGL config, and cite the page.

## Visual style: blocky 3D
Characters from primitives (box torso, blocky head, simple limbs, face with eyes and mouth), flat pastel colours, soft lighting with shadows, perspective camera. Reusable components: Character, Scene, Caption, TimeLabel, CounterCard. Real 3D only: depth, lighting, shadows, camera movement in 3D space. No pile of 2D shapes.
Animations: idle bob, walk, head tilt, shock shake, point/arm raise, pop-in props, camera push-in/pull-out/pan.
Captions: large, high contrast, bottom third, word-by-word highlight (yellow), rendered by Remotion, one style only.

## Acceptance checklist (I judge, comparing against two reference frames I choose)
Score 0-2 each: character design, consistency, 3D appearance (depth/lighting/perspective), animation noticeable, environment coherent, captions readable on phone, export 1080x1920. Watermark: pass/fail.
Pass = total >= 10/14, no 0 on character design or 3D appearance, no watermark. These thresholds are an arbitrary choice, not an industry standard.
Stopping rule: characters still bad after 3 revision rounds -> stop and evaluate the fallback (Gemini stills + CapCut).

## Duplication blocklist
References (owner-supplied, unaudited): @kalaulah.my, @sohow.my, @lelongcentralmy, @vinvinlah.apasal. Study structure only. Do not copy scripts, hooks, characters, captions, visuals or scenarios.
Avoid: zombie outbreak, nuclear KL, Malaysia winter, ringgit vs SGD, Johor-Kuching bridge, KLIA, blackout, internet outage, AI bill-splitting app, "kepala bapak kau", outfit-choice skit, women's body fat.

## Checkpoints
Post 5: production efficiency. Post 15: WHY vs WHAT IF, patterns not outliers. Post 30: themes, formats, language, audience. No new formats or repositioning before Post 15 unless my own data contradicts the plan. No buying followers or views.

## Audience learning
Strong signals: people spontaneously describing a real problem, repeated workarounds, stated frequency or cost, willingness to test. Weak: views, likes, "cool app idea". Never recommend building an app because a video did well.

## Git
Check existing Git state before init. Show the file list and wait for my OK before every commit. Never commit .env, credentials, secrets, node_modules, exports or large media.

## Files
production/workflow.md | production/preflight-checklist.md | content/ideas/idea-database.csv | production/templates/* | analytics/performance-tracker.csv
