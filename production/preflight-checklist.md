# Preflight checklist

Run before every final render and publish. Tick each item.

## Licence
- [ ] Remotion Free Licence eligibility re-checked at https://www.remotion.dev/docs/license/faq (free for "an individual, whether for personal or commercial use" as of 2026-11-08).
- [ ] Check for licence changes. Known as of 2026-11-08: the FAQ says Remotion 5.0 will make telemetry mandatory for "Remotion for Automators" customers; telemetry "remains voluntary for Free License users". If the project has been upgraded to 5.0, re-read the licence and terms.

## Tooling
- [ ] Remotion Claude Code plugin loads (its skills, e.g. `/remotion:remotion-best-practices`, are listed in the session).
- [ ] `npx remotion versions` shows all Remotion packages at the same version.

## Render
- [ ] 3D renders: depth, lighting and shadows visible in a still.
- [ ] Export is 1080x1920, 30fps, H.264 MP4.
- [ ] No watermark or unexpected overlay anywhere in the video.

## Assets
- [ ] Every music/SFX/third-party asset is logged in `production/assets/licence-log.md` with commercial use = Y, and approved.
