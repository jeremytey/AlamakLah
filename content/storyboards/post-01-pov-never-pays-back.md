# Storyboard: Post 01 POV - "POV: your friend that never pays you back"
30 fps, 945 frames (31.5 s), 1080x1920. Frame numbers are the initial values in video-project/src/post01PovTiming.ts and will be re-timed to the voice.

| Scene | Frames (s) | Set | Action | Camera | Overlays | Transition out |
|---|---|---|---|---|---|---|
| S1 The intro | 0-120 (0-4) | Restaurant: table, stools, menu board (blocks, no text), two plates | Bill tray slides onto the table (f10-30). You (blue) reach to your pocket and raise your wallet. Friend (orange) leans back hard (lean -0.45) with a big smile, then settles to the S2 lean by f118. | Slow push-in that ends exactly on the S2 angle (no cut) | Caption only | None (continuous) |
| S2 Dinner 1 | 120-180 (4-6) | Same restaurant, rice + sambal plates | Friend talks (mouth flaps, nods) while the excuse caption plays. You slump your head and hand over a note; the note lands on the bill tray. Friend gives a thumbs-up at chest height (box thumb). Pause. | Fixed angle | TimeLabel DINNER 1, excuse caption | Straight continue (same angle, food changes) |
| S2 Dinner 2 | 180-240 (6-8) | Same, fried noodle plates | Same beats; the tray now shows 2 notes | Same fixed angle | DINNER 2 | Straight continue |
| S2 Dinner 3 | 240-300 (8-10) | Same, flatbread plates | Same beats; 3 notes | Same fixed angle | DINNER 3 | Straight continue |
| S3 The sponsor | 300-420 (10-14) | Same restaurant, plates change each beat | Four 1 s beats: you pay with a note, card, phone, then a note; friend gives the same thumbs-up each time. Your head sinks a bit lower each beat. Notes stack on the tray. | Same fixed angle | CounterCard DEBT RM 60 -> RM 80 -> RM 100 (held), caption | Fade through dark (18 frames each side) |
| S4 The discovery | 420-600 (14-20) | Bedroom: bed, blanket, pillow, bedside table, lamp with a warm glow, dusk-blue wall | You half-sit against the pillow (legs under a short blanket) holding the phone up in front of your chest with both hands, below your face. Your face goes from curious to disbelieving (brows up, eyes wider, mouth neutral) as the stories swipe. | 3/4 front, you on the left, lamp on the far left | PhoneScreen overlay on the right: watch -> airport selfie (large plane in open sky) -> holiday (swipes at f488, f545) | Phone zooms to full screen |
| S5 The realisation | 600-780 (20-26) | Full-screen PhoneScreen over the bedroom | Zoom in (f600-616). Swipe back to the watch for "new watch", then to the holiday for "overseas holidays". Notification banner drops at f690. Narration ends "...but he can't pay back RM100.". Phone shrinks and fades away (f745-757) for a brief cut back to you in disbelief. | Bedroom camera starts easing toward the S6 framing from f745 | Banner inside the phone, caption | Continuous |
| S6 The payoff | 780-945 (26-31.5) | Bedroom | You lower the phone into your lap (hands rest on the blanket), turn your head to the camera and stare blankly (neutral mouth, no movement from f820; frozen hold to the end). | Higher camera looking slightly down; face in the upper-middle; holds from f830 | CounterCard DEBT RM 100 (from f790), banner "Trust me bro, later." at the top (f838), end caption f861-945 (84 frames, ends on the final frame) | End |

## Placement rules checked
- Faces vs overlays: a projection check (scratch script) found no overlap on any of the 945 frames between either character's head and the TimeLabel, CounterCard, PhoneScreen, S6 banner or caption area. The overlay boxes were measured from stills, so this is an approximation.
- Captions: each page stays up until the next page's first word (derived in the timing file).
- The PhoneScreen is a 2D overlay, an approved exception to the real-3D-only rule.
- Transitions: only the fade through dark from S3 into S4.
