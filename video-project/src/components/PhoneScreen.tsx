import React from "react";

// 2D phone overlay: a GENERIC stories screen (no real app UI, logos or brand marks).
// Everything is drawn from coloured blocks and circles. Sizes scale with the phone width.

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

export type StoryCardKind = "watch" | "airport" | "holiday";

export type BannerState = { sender: string; text: string; progress: number }; // progress 0 = hidden, 1 = in place

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Blocky friend face, same colours as the 3D friend (orange shirt).
const FriendFace: React.FC<{ left: string; top: string; size: number; shades?: boolean }> = ({
  left,
  top,
  size,
  shades,
}) => (
  <div style={abs({ left, top, width: size, height: size * 1.45 })}>
    <div style={abs({ left: -size * 0.2, top: size * 1.0, width: size * 1.4, height: size * 0.5, background: "#f5a35f", borderRadius: size * 0.06 })} />
    <div style={abs({ left: 0, top: size * 0.08, width: size, height: size, background: "#eab98e" })} />
    <div style={abs({ left: -size * 0.04, top: 0, width: size * 1.08, height: size * 0.24, background: "#2b2b38" })} />
    {shades ? (
      <div style={abs({ left: size * 0.1, top: size * 0.36, width: size * 0.8, height: size * 0.2, background: "#1d1d24" })} />
    ) : (
      [0.18, 0.58].map((x) => (
        <div key={x} style={abs({ left: size * x, top: size * 0.34, width: size * 0.24, height: size * 0.24, background: "#fff" })}>
          <div style={abs({ left: size * 0.06, top: size * 0.05, width: size * 0.12, height: size * 0.15, background: "#1d1d24" })} />
        </div>
      ))
    )}
    <div style={abs({ left: size * 0.2, top: size * 0.68, width: size * 0.6, height: size * 0.2, background: "#5b2a2a" })}>
      <div style={abs({ left: size * 0.04, top: size * 0.03, width: size * 0.52, height: size * 0.07, background: "#fff" })} />
    </div>
  </div>
);

const WatchCard: React.FC<{ u: number }> = ({ u }) => (
  <div style={abs({ inset: 0, background: "#f6e7c8" })}>
    <div style={abs({ left: "38%", top: "14%", width: "24%", height: "72%", background: "#4a4f63", borderRadius: u * 3 })} />
    <div style={abs({ left: "22%", top: "32%", width: u * 56, height: u * 56, borderRadius: "50%", background: "#e9c46a", border: `${u * 1.6}px solid #c9a24a` })}>
      <div style={abs({ left: u * 5, top: u * 5, width: u * 42.8, height: u * 42.8, borderRadius: "50%", background: "#fffdf7" })}>
        <div style={abs({ left: u * 20.4, top: u * 6, width: u * 2, height: u * 16, background: "#1d1d24", borderRadius: u })} />
        <div style={abs({ left: u * 20.4, top: u * 20.4, width: u * 13, height: u * 2, background: "#1d1d24", borderRadius: u })} />
      </div>
    </div>
    {/* sparkles */}
    {[
      [14, 20],
      [76, 26],
      [70, 72],
    ].map(([x, y], i) => (
      <div key={i} style={abs({ left: `${x}%`, top: `${y}%`, width: u * 5, height: u * 5, background: "#ffd400", transform: "rotate(45deg)" })} />
    ))}
  </div>
);

// Airport selfie: open blue sky, a large plane silhouette climbing, runway strip, friend's face.
const AirportCard: React.FC<{ u: number }> = ({ u }) => (
  <div style={abs({ inset: 0, background: "#8fcdf2" })}>
    {/* clouds */}
    {[
      [8, 8, 30],
      [60, 14, 26],
      [30, 34, 22],
    ].map(([x, y, w], i) => (
      <div key={i} style={abs({ left: `${x}%`, top: `${y}%`, width: u * w, height: u * w * 0.32, borderRadius: u * 20, background: "#ffffff", opacity: 0.9 })} />
    ))}
    {/* plane: fuselage, nose, wing, tail fin, tail wing, windows; tilted to climb */}
    <div style={abs({ left: "6%", top: "16%", width: u * 88, height: u * 40, transform: "rotate(-14deg)" })}>
      <div style={abs({ left: u * 26, top: u * 24, width: u * 30, height: u * 9, background: "#d7dde6", transform: "skewX(-35deg)", borderRadius: u })} />
      <div style={abs({ left: u * 4, top: u * 15, width: u * 76, height: u * 11, background: "#ffffff", borderRadius: `${u * 3}px ${u * 6}px ${u * 6}px ${u * 3}px` })} />
      <div style={abs({ left: u * 2, top: u * 2, width: u * 12, height: u * 15, background: "#ffffff", transform: "skewX(-25deg)", borderRadius: u })} />
      <div style={abs({ left: u * 4, top: u * 3, width: u * 6, height: u * 10, background: "#f2a7c3", transform: "skewX(-25deg)" })} />
      <div style={abs({ left: u * 26, top: u * 9, width: u * 26, height: u * 7, background: "#d7dde6", transform: "skewX(35deg)", borderRadius: u })} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={abs({ left: u * (24 + i * 7), top: u * 18, width: u * 3.2, height: u * 3.2, borderRadius: "50%", background: "#7fa8e6" })} />
      ))}
    </div>
    {/* runway / ground */}
    <div style={abs({ left: 0, top: "80%", width: "100%", height: "20%", background: "#b9bec8" })} />
    <div style={abs({ left: "10%", top: "88%", width: "80%", height: u * 1.6, background: "#ffffff" })} />
    <FriendFace left="10%" top="52%" size={u * 34} />
  </div>
);

const HolidayCard: React.FC<{ u: number }> = ({ u }) => (
  <div style={abs({ inset: 0, background: "#9fd8f2" })}>
    <div style={abs({ left: "66%", top: "8%", width: u * 18, height: u * 18, borderRadius: "50%", background: "#ffd96a" })} />
    <div style={abs({ left: 0, top: "40%", width: "100%", height: "22%", background: "#5fb8d6" })} />
    <div style={abs({ left: 0, top: "62%", width: "100%", height: "38%", background: "#f3dca5" })} />
    {/* palm */}
    <div style={abs({ left: "76%", top: "22%", width: u * 4, height: "46%", background: "#a8784e", transform: "rotate(6deg)" })} />
    {[-35, 0, 35].map((r) => (
      <div key={r} style={abs({ left: "64%", top: "19%", width: u * 26, height: u * 7, borderRadius: "50%", background: "#6cbf7a", transform: `rotate(${r}deg)` })} />
    ))}
    <FriendFace left="16%" top="40%" size={u * 38} shades />
  </div>
);

const Card: React.FC<{ kind: StoryCardKind; u: number }> = ({ kind, u }) =>
  kind === "watch" ? <WatchCard u={u} /> : kind === "airport" ? <AirportCard u={u} /> : <HolidayCard u={u} />;

// Notification banner. `width` in px; used inside the phone and directly on the video.
export const NotificationBanner: React.FC<{ width: number; banner: BannerState }> = ({ width, banner }) => {
  const u = width / 100;
  return (
    <div
      style={{
        width,
        transform: `translateY(${(1 - banner.progress) * -140}%)`,
        opacity: banner.progress > 0 ? 1 : 0,
        background: "rgba(255,255,255,0.97)",
        borderRadius: u * 5,
        boxShadow: `0 ${u}px ${u * 4}px rgba(0,0,0,0.3)`,
        padding: `${u * 3.2}px ${u * 4}px`,
        display: "flex",
        gap: u * 3.5,
        alignItems: "flex-start",
        fontFamily: FONT,
        boxSizing: "border-box",
      }}
    >
      {/* generic app icon: plain pastel square, no logo */}
      <div style={{ flex: "none", width: u * 11, height: u * 11, borderRadius: u * 2.6, background: "#7fa8e6" }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: u * 4.4, color: "#1d1d24", fontWeight: 800 }}>
          <span>{banner.sender}</span>
          <span style={{ fontWeight: 500, color: "#7a7d88" }}>now</span>
        </div>
        <div style={{ fontSize: u * 4.6, color: "#1d1d24", fontWeight: 500, lineHeight: 1.25, marginTop: u * 0.8 }}>
          {banner.text}
        </div>
      </div>
    </div>
  );
};

export const PhoneScreen: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  cards: StoryCardKind[];
  cardPos: number; // 0 = first card centred; fractional values are mid-swipe
  banner?: BannerState | null;
  opacity?: number;
}> = ({ x, y, width, height, cards, cardPos, banner, opacity = 1 }) => {
  const u = width / 100;
  const bezel = u * 3;
  const active = Math.round(cardPos);
  return (
    <div
      style={abs({
        left: x,
        top: y,
        width,
        height,
        opacity,
        background: "#1d1d24",
        borderRadius: u * 9,
        boxShadow: `0 ${u * 2}px ${u * 6}px rgba(0,0,0,0.35)`,
      })}
    >
      <div
        style={abs({
          left: bezel,
          top: bezel,
          right: bezel,
          bottom: bezel,
          borderRadius: u * 6.5,
          overflow: "hidden",
          background: "#000",
        })}
      >
        {/* cards strip, swipes left */}
        <div style={abs({ inset: 0, display: "flex", transform: `translateX(${-cardPos * 100}%)` })}>
          {cards.map((k, i) => (
            <div key={i} style={{ position: "relative", flex: "none", width: "100%", height: "100%" }}>
              <Card kind={k} u={u} />
            </div>
          ))}
        </div>
        {/* generic story chrome: progress bars + account row */}
        <div style={abs({ left: u * 3, right: u * 3, top: u * 3, display: "flex", gap: u * 1.2 })}>
          {cards.map((_, i) => (
            <div key={i} style={{ flex: 1, height: u * 0.9, borderRadius: u, background: i <= active ? "#ffffff" : "rgba(255,255,255,0.45)" }} />
          ))}
        </div>
        <div style={abs({ left: u * 4, top: u * 6.5, display: "flex", alignItems: "center", gap: u * 2.5 })}>
          <div style={{ width: u * 8, height: u * 8, borderRadius: "50%", background: "#f5a35f", border: `${u * 0.6}px solid #fff` }} />
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: u * 4.4, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            friend
          </span>
        </div>
        {banner ? (
          <div style={abs({ left: u * 3, right: u * 3, top: u * 4 })}>
            <NotificationBanner width={width - bezel * 2 - u * 6} banner={banner} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
