import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// One caption style for the whole channel: large white, black outline,
// bottom third, words revealed one by one, emphasis words in yellow.

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";
const YELLOW = "#ffd400";

export type CaptionWord = { text: string; emphasis?: boolean; at: number }; // at = frame (relative)

export const Caption: React.FC<{ words: CaptionWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <div
        style={{
          width: 920,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1.15,
          WebkitTextStroke: "10px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0, 0, 0, 0.55)",
        }}
      >
        {words.map((w, i) => {
          const s = spring({ frame: frame - w.at, fps, config: { damping: 14, stiffness: 220 } });
          const opacity = interpolate(frame - w.at, [0, 3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: w.emphasis ? YELLOW : "#ffffff",
                opacity,
                transform: `scale(${0.7 + 0.3 * s})`,
                margin: "0 0.12em",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
};

export const TimeLabel: React.FC<{ text: string }> = ({ text }) => {
  const s = usePop();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "#1d1d24",
          color: "#ffffff",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: 4,
          padding: "14px 40px",
          borderRadius: 999,
          border: "5px solid #ffffff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const CounterCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "#ffffff",
          borderRadius: 28,
          padding: "12px 36px",
          display: "flex",
          alignItems: "baseline",
          gap: 22,
          fontFamily: FONT,
          fontWeight: 800,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          border: "5px solid #1d1d24",
        }}
      >
        <span style={{ fontSize: 40, color: "#1d1d24", letterSpacing: 3 }}>{label}</span>
        <span style={{ fontSize: 72, color: "#e0393e" }}>{value}</span>
      </div>
    </AbsoluteFill>
  );
};
