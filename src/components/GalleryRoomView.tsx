"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

type GalleryRoomViewProps = {
  active: boolean;
  /** 5–10 pieces; first goes on the far wall, the rest alternate left/right */
  artworks?: Artwork[];
};

const MIN_ARTWORKS = 5;
const MAX_ARTWORKS = 10;

export type Artwork = {
  id: string;
  title: string;
  year: string;
  medium: string;
  note: string;
  aspect: "wide" | "tall" | "square";
  /** Wood frame + mat when true; stretched 3D canvas when false */
  framed?: boolean;
  /** Sanity image URL; falls back to a painterly gradient when absent */
  imageUrl?: string;
};

const DEMO_ARTWORKS: Artwork[] = [
  {
    id: "far-wide",
    title: "Untitled Field",
    year: "2026",
    medium: "Oil on canvas",
    note: "Demo piece — tap any frame to open this glass inspect view.",
    aspect: "wide",
    framed: true,
  },
  {
    id: "left-a",
    title: "Soft Geometry I",
    year: "2025",
    medium: "Acrylic on panel",
    note: "Side-wall demo. Close with the button, backdrop, or Escape.",
    aspect: "tall",
    framed: false,
  },
  {
    id: "left-b",
    title: "Quiet Square",
    year: "2025",
    medium: "Mixed media",
    note: "Glass panel keeps the room behind you while you look closer.",
    aspect: "square",
    framed: true,
  },
  {
    id: "left-c",
    title: "Soft Geometry II",
    year: "2025",
    medium: "Acrylic on panel",
    note: "Same inspect pattern for every frame — no camera fly.",
    aspect: "tall",
    framed: false,
  },
  {
    id: "right-a",
    title: "North Wall Study",
    year: "2024",
    medium: "Charcoal & wash",
    note: "All seven frames should open this overlay.",
    aspect: "tall",
    framed: true,
  },
  {
    id: "right-b",
    title: "Interval",
    year: "2024",
    medium: "Ink on paper",
    note: "Frosted glass + soft blur over the gallery.",
    aspect: "square",
    framed: false,
  },
  {
    id: "right-c",
    title: "North Wall Study II",
    year: "2024",
    medium: "Charcoal & wash",
    note: "Say if you want captions, next/prev, or a different glass look.",
    aspect: "tall",
    framed: true,
  },
];

// Painterly placeholder canvases — swapped for Sanity images later.
const ART_BG: Record<string, string> = {
  "far-wide": [
    "radial-gradient(circle at 68% 26%, rgba(255,241,205,0.85), rgba(255,241,205,0) 24%)",
    "linear-gradient(180deg, #dfe7ea 0%, #cfd8d6 36%, #a9b596 52%, #7e8f63 66%, #5d6e46 82%, #47543a 100%)",
  ].join(", "),
  "left-a":
    "linear-gradient(118deg, #c96f3b 0%, #c96f3b 36%, #e8d9bf 37%, #e8d9bf 62%, #35506b 63%, #2b4258 100%)",
  "left-b": [
    "radial-gradient(ellipse 90% 60% at 50% 30%, rgba(255,255,255,0.12), transparent 70%)",
    "linear-gradient(180deg, #c05a3e 0%, #b9553f 46%, #7a3325 58%, #642a1e 100%)",
  ].join(", "),
  "left-c":
    "linear-gradient(298deg, #b8874a 0%, #b8874a 30%, #ded3bd 31%, #ded3bd 58%, #43617a 59%, #364f65 100%)",
  "right-a": [
    "radial-gradient(ellipse 55% 45% at 40% 34%, rgba(60,52,42,0.55), transparent 62%)",
    "linear-gradient(180deg, #e8e2d4 0%, #cdc5b4 58%, #a29882 100%)",
  ].join(", "),
  "right-b": [
    "repeating-linear-gradient(90deg, rgba(35,35,44,0.85) 0%, rgba(35,35,44,0.85) 5%, rgba(236,230,216,0) 5%, rgba(236,230,216,0) 16%)",
    "linear-gradient(180deg, #ece6d8 0%, #ddd5c2 100%)",
  ].join(", "),
  "right-c": [
    "radial-gradient(ellipse 50% 42% at 62% 58%, rgba(74,64,52,0.5), transparent 60%)",
    "linear-gradient(200deg, #efe9db 0%, #cfc7b5 55%, #a49a87 100%)",
  ].join(", "),
};

const ART_FALLBACK_BG =
  "linear-gradient(180deg, #ddd5c6 0%, #d0c6b4 100%)";

function artBackground(artwork: Artwork): string {
  if (artwork.imageUrl) {
    return `#2a241c url("${artwork.imageUrl}") center / cover no-repeat`;
  }
  return ART_BG[artwork.id] ?? ART_FALLBACK_BG;
}

function preloadArtworkImages(items: Artwork[]) {
  for (const artwork of items) {
    if (!artwork.imageUrl) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = artwork.imageUrl;
  }
}

export default function GalleryRoomView({
  active,
  artworks,
}: GalleryRoomViewProps) {
  // Clamp to 5–10, padding with demo pieces when fewer are supplied
  const list = useMemo(() => {
    const src = artworks && artworks.length > 0 ? artworks : DEMO_ARTWORKS.slice(0, MIN_ARTWORKS);
    if (src.length >= MIN_ARTWORKS) return src.slice(0, MAX_ARTWORKS);
    const fill = DEMO_ARTWORKS.filter(
      (d) => !src.some((s) => s.id === d.id)
    ).slice(0, MIN_ARTWORKS - src.length);
    return [...src, ...fill];
  }, [artworks]);

  const farArt = list[0];
  const leftArts = useMemo(
    () => list.filter((_, i) => i > 0 && i % 2 === 1),
    [list]
  );

  useEffect(() => {
    preloadArtworkImages(list);
  }, [list]);
  const rightArts = useMemo(
    () => list.filter((_, i) => i > 0 && i % 2 === 0),
    [list]
  );
  // Frames sit at space-evenly positions: (i+1)/(n+1) along the wall
  const leftCenters = leftArts.map((_, i) => (i + 1) / (leftArts.length + 1));
  const rightCenters = rightArts.map(
    (_, i) => (i + 1) / (rightArts.length + 1)
  );
  // Room depth scales off the fuller side wall (see --room-d in CSS)
  const sideCount = Math.max(leftArts.length, rightArts.length);

  const rootRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const frameEls = useRef(new Map<string, HTMLElement>());
  const dragging = useRef(false);
  const moved = useRef(false);
  const framePress = useRef<string | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const look = useRef({ yaw: 8, pitch: -8 });
  const targetLook = useRef({ yaw: 8, pitch: -8 });
  const overFrame = useRef(false);
  const hoverId = useRef<string | null>(null);
  const hoverRaf = useRef(0);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [hoverFrame, setHoverFrame] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const inspected = list.find((a) => a.id === inspectId) ?? null;

  const registerFrame = (id: string, node: HTMLElement | null) => {
    if (node) frameEls.current.set(id, node);
    else frameEls.current.delete(id);
  };

  const setHoveredFrame = (id: string | null) => {
    if (id === hoverId.current) return;
    if (hoverId.current) {
      frameEls.current
        .get(hoverId.current)
        ?.classList.remove("gallery-frame--hover");
    }
    if (id) {
      frameEls.current.get(id)?.classList.add("gallery-frame--hover");
    }
    hoverId.current = id;
  };

  const openInspect = (id: string) => {
    overFrame.current = false;
    setHoveredFrame(null);
    setHoverFrame(false);
    setInspectId(id);
  };
  const closeInspect = () => setInspectId(null);

  // Write the transform directly on the rig. Setting CSS custom properties on
  // the root invalidated styles for the entire room subtree on every pointer
  // move — a major source of drag jank.
  const applyLook = () => {
    const rig = rigRef.current;
    if (!rig) return;
    const { pitch, yaw } = look.current;
    rig.style.transform = `rotateX(${pitch}deg) rotateY(${yaw}deg)`;
  };

  const pickFrameAt = (clientX: number, clientY: number) => {
    const maxArea = window.innerWidth * window.innerHeight * 0.42;
    let best: { id: string; score: number } | null = null;

    for (const [id, el] of frameEls.current) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;

      const area = r.width * r.height;
      if (area > maxArea) continue;

      // Edge-on walls project as skinny AABBs — skip those
      const ratio = Math.min(r.width, r.height) / Math.max(r.width, r.height);
      if (ratio < 0.2) continue;

      if (
        clientX < r.left ||
        clientX > r.right ||
        clientY < r.top ||
        clientY > r.bottom
      ) {
        continue;
      }

      // Prefer hits near the frame center (rejects giant skewed AABBs)
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      const nx = (clientX - cx) / (r.width * 0.5);
      const ny = (clientY - cy) / (r.height * 0.5);
      const dist = Math.hypot(nx, ny);
      if (dist > 0.95) continue;

      // Face-on + close to center wins over huge background projections
      const score = ratio * 3 - dist;
      if (!best || score > best.score) best = { id, score };
    }

    return best?.id ?? null;
  };

  const syncHover = (clientX: number, clientY: number) => {
    cancelAnimationFrame(hoverRaf.current);
    hoverRaf.current = requestAnimationFrame(() => {
      const id = pickFrameAt(clientX, clientY);
      setHoveredFrame(id);
      const over = id !== null;
      if (over !== overFrame.current) {
        overFrame.current = over;
        setHoverFrame(over);
      }
    });
  };

  useEffect(() => {
    if (!inspectId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInspect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspectId]);

  // Damped look loop: input moves targets; camera eases once per frame.
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const cur = look.current;
      const tgt = targetLook.current;
      const dy = tgt.yaw - cur.yaw;
      const dp = tgt.pitch - cur.pitch;
      if (Math.abs(dy) > 0.005 || Math.abs(dp) > 0.005) {
        cur.yaw += dy * 0.12;
        cur.pitch += dp * 0.12;
        applyLook();
      }
      raf = requestAnimationFrame(tick);
    };
    applyLook();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  useEffect(() => {
    if (!active || inspectId) return;

    const onPointerDown = (e: PointerEvent) => {
      // Stop the browser from starting text selection / native element drag —
      // a native drag ghosts the labels and kills the pointermove stream
      e.preventDefault();
      moved.current = false;
      last.current = { x: e.clientX, y: e.clientY };

      const hit = pickFrameAt(e.clientX, e.clientY);
      if (hit) {
        // Painting: click only — no look-drag
        framePress.current = hit;
        dragging.current = false;
        setIsDragging(false);
        return;
      }

      framePress.current = null;
      dragging.current = true;
      setIsDragging(true);
      setHoveredFrame(null);
      if (overFrame.current) {
        overFrame.current = false;
        setHoverFrame(false);
      }
      rootRef.current?.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (framePress.current) {
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) {
          // Drag started on a painting — cancel click, switch to look-around
          framePress.current = null;
          moved.current = true;
          dragging.current = true;
          setIsDragging(true);
          setHoveredFrame(null);
          last.current = { x: e.clientX, y: e.clientY };
          rootRef.current?.setPointerCapture(e.pointerId);
        }
        return;
      }

      if (!dragging.current) {
        syncHover(e.clientX, e.clientY);
        return;
      }

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      last.current = { x: e.clientX, y: e.clientY };

      targetLook.current = {
        yaw: targetLook.current.yaw + dx * 0.11,
        pitch: Math.max(
          -30,
          Math.min(30, targetLook.current.pitch - dy * 0.09)
        ),
      };
    };

    const onPointerUp = (e: PointerEvent) => {
      const pressedFrame = framePress.current;
      const tapped = Boolean(pressedFrame) && !moved.current;

      framePress.current = null;
      dragging.current = false;
      setIsDragging(false);

      try {
        rootRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      // Only open when the press started on a painting — never on empty drag space
      if (tapped && pressedFrame) {
        openInspect(pressedFrame);
      } else {
        syncHover(e.clientX, e.clientY);
      }
    };

    const node = rootRef.current;
    if (!node) return;

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", onPointerUp);
    node.addEventListener("pointercancel", onPointerUp);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", onPointerUp);
      node.removeEventListener("pointercancel", onPointerUp);
    };
  }, [active, inspectId]);

  return (
    <div
      ref={rootRef}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={[
        "gallery-room-view",
        active ? "gallery-room-view--active" : "",
        inspected ? "gallery-room-view--inspecting" : "",
        hoverFrame && !inspected && !isDragging ? "gallery-room-view--over-frame" : "",
        isDragging ? "gallery-room-view--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="gallery-room-perspective">
        <div
          className="gallery-room-rig"
          ref={rigRef}
          style={{ "--side-count": sideCount } as CSSProperties}
        >
          <div className="gallery-room-face gallery-room-face--far">
            <div className="gallery-wall-frames gallery-wall-frames--far">
              <Frame
                artwork={farArt}
                className={`gallery-frame--${farArt.aspect}`}
                register={registerFrame}
              />
            </div>
            <div className="gallery-wall-wash" />
          </div>
          <div className="gallery-room-face gallery-room-face--near" />
          <div className="gallery-room-face gallery-room-face--left">
            <div className="gallery-wall-frames gallery-wall-frames--side">
              {leftArts.map((art) => (
                <Frame
                  key={art.id}
                  artwork={art}
                  className={`gallery-frame--${art.aspect}`}
                  register={registerFrame}
                />
              ))}
            </div>
            {leftCenters.map((c, i) => (
              <div
                key={i}
                className="gallery-wash-spot"
                style={{ left: `${c * 100}%` }}
                aria-hidden
              />
            ))}
            <div className="gallery-wall-wash" />
          </div>
          <div className="gallery-room-face gallery-room-face--right">
            <div className="gallery-wall-frames gallery-wall-frames--side">
              {rightArts.map((art) => (
                <Frame
                  key={art.id}
                  artwork={art}
                  className={`gallery-frame--${art.aspect}`}
                  register={registerFrame}
                />
              ))}
            </div>
            {rightCenters.map((c, i) => (
              <div
                key={i}
                className="gallery-wash-spot"
                style={{ left: `${c * 100}%` }}
                aria-hidden
              />
            ))}
            <div className="gallery-wall-wash" />
          </div>
          <div className="gallery-room-face gallery-room-face--ceiling" />
          <div className="gallery-room-face gallery-room-face--floor">
            {leftCenters.map((c, i) => (
              <div
                key={`l${i}`}
                className="gallery-floor-pool"
                style={{ left: "8%", top: `${c * 100}%` }}
                aria-hidden
              />
            ))}
            {rightCenters.map((c, i) => (
              <div
                key={`r${i}`}
                className="gallery-floor-pool"
                style={{ left: "92%", top: `${c * 100}%` }}
                aria-hidden
              />
            ))}
            <div
              className="gallery-floor-pool gallery-floor-pool--center"
              style={{ left: "50%", top: "30%" }}
              aria-hidden
            />
            <div
              className="gallery-floor-pool gallery-floor-pool--center"
              style={{ left: "50%", top: "70%" }}
              aria-hidden
            />
          </div>
          <GalleryTrackLights
            leftCenters={leftCenters}
            rightCenters={rightCenters}
          />
          <GalleryBench />
          <div className="gallery-rails" aria-hidden>
            <div className="gallery-rail-plane gallery-rail-plane--far">
              <GalleryRailing posts={6} />
            </div>
            <div className="gallery-rail-plane gallery-rail-plane--near">
              <GalleryRailing posts={5} />
            </div>
            <div className="gallery-rail-plane gallery-rail-plane--left">
              <GalleryRailing posts={4 + sideCount} />
            </div>
            <div className="gallery-rail-plane gallery-rail-plane--right">
              <GalleryRailing posts={4 + sideCount} />
            </div>
          </div>
        </div>
      </div>
      <div className="gallery-room-grade" aria-hidden />
      <div className="gallery-room-grain" aria-hidden />

      {inspected &&
        createPortal(
          <div
            className="gallery-inspect"
            role="dialog"
            aria-modal="true"
            aria-label={inspected.title}
            onClick={closeInspect}
          >
            <div className="gallery-inspect__glass" aria-hidden />
            <button
              type="button"
              className="gallery-inspect__close"
              onClick={(e) => {
                e.stopPropagation();
                closeInspect();
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
            <div
              className="gallery-inspect__content"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`gallery-inspect__art gallery-inspect__art--${inspected.aspect}`}
                style={{ background: artBackground(inspected) }}
                role="img"
                aria-label={inspected.title}
              />
              <div className="gallery-inspect__meta">
                <p className="gallery-inspect__eyebrow">Demo inspect</p>
                <h2 className="gallery-inspect__title">{inspected.title}</h2>
                <p className="gallery-inspect__sub">
                  {inspected.medium} · {inspected.year}
                </p>
                <p className="gallery-inspect__note">{inspected.note}</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

type SpotConfig = {
  along: number;
  aim: number;
  tilt: number;
};

function GalleryTrackLights({
  leftCenters,
  rightCenters,
}: {
  leftCenters: number[];
  rightCenters: number[];
}) {
  // One spot per painting on each side track, two on the center run
  const layout: { x: number; spots: SpotConfig[] }[] = [
    {
      x: -0.32,
      spots: leftCenters.map((c) => ({ along: c - 0.5, aim: -24, tilt: 46 })),
    },
    {
      x: 0,
      spots: [
        { along: -0.2, aim: 0, tilt: 52 },
        { along: 0.2, aim: -4, tilt: 54 },
      ],
    },
    {
      x: 0.32,
      spots: rightCenters.map((c) => ({ along: c - 0.5, aim: 24, tilt: 46 })),
    },
  ];

  return (
    <div className="gallery-tracks" aria-hidden>
      {layout.map((track, i) => (
        <div
          key={i}
          className="gallery-track"
          style={{ "--track-x": track.x } as CSSProperties}
        >
          <SolidBox
            className="gallery-track__rail"
            w="12px"
            h="12px"
            d="calc(var(--room-d) * 0.72)"
            faceClass="gallery-track__rail-face"
            faces={["bottom", "left", "right"]}
          />
          {track.spots.map((spot, j) => (
            <div
              key={j}
              className="gallery-spot"
              style={
                {
                  "--spot-along": spot.along,
                  "--spot-aim": `${spot.aim}deg`,
                } as CSSProperties
              }
            >
              <div className="gallery-spot__clamp" />
              <div
                className="gallery-spot__pivot"
                style={{ "--spot-tilt": `${spot.tilt}deg` } as CSSProperties}
              >
                <div className="gallery-spot__arm" />
                <SolidBox
                  className="gallery-spot__body"
                  w="18px"
                  h="18px"
                  d="30px"
                  faceClass="gallery-spot__body-face"
                  faces={["front", "left", "right", "bottom"]}
                >
                  <div className="gallery-spot__lens" />
                </SolidBox>
                <div className="gallery-spot__beam" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const ALL_FACES = ["front", "back", "left", "right", "top", "bottom"] as const;

function SolidBox({
  className = "",
  w,
  h,
  d,
  faceClass = "",
  faces = ALL_FACES as readonly string[],
  children,
}: {
  className?: string;
  w: string;
  h: string;
  d: string;
  faceClass?: string;
  /* Every 3D face is its own composited layer — render only the visible ones */
  faces?: readonly string[];
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`solid-box ${className}`.trim()}
      style={
        {
          "--bx-w": w,
          "--bx-h": h,
          "--bx-d": d,
        } as CSSProperties
      }
    >
      {faces.map((f) => (
        <div
          key={f}
          className={`solid-box__face solid-box__face--${f} ${faceClass}`.trim()}
        />
      ))}
      {children}
    </div>
  );
}

function GalleryRailing({ posts }: { posts: number }) {
  return (
    <div className="gallery-railing" aria-hidden>
      <div className="gallery-railing__bar" />
      <div className="gallery-railing__posts">
        {Array.from({ length: posts }, (_, i) => (
          <span key={i} className="gallery-railing__post" />
        ))}
      </div>
    </div>
  );
}

function Frame({
  artwork,
  className = "",
  register,
}: {
  artwork: Artwork;
  className?: string;
  register: (id: string, node: HTMLElement | null) => void;
}) {
  const framed = artwork.framed !== false;
  const surfaceStyle = { background: artBackground(artwork) };

  return (
    <div
      ref={(node) => register(artwork.id, node)}
      className={[
        "gallery-frame",
        "gallery-frame-hit",
        framed ? "gallery-frame--with-frame" : "gallery-frame--canvas",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-artwork-id={artwork.id}
      role="button"
      tabIndex={0}
      aria-label={`View ${artwork.title}`}
    >
      {framed ? (
        <div className="gallery-frame__mat">
          <div className="gallery-frame__surface" style={surfaceStyle} />
        </div>
      ) : (
        <div className="gallery-canvas">
          <div className="gallery-canvas__edge" aria-hidden />
          <div className="gallery-frame__surface" style={surfaceStyle} />
        </div>
      )}
      <div className="gallery-frame__hover-glow" aria-hidden />
      <div className="gallery-frame__label" aria-hidden>
        <span className="gallery-frame__label-title">{artwork.title}</span>
        <span className="gallery-frame__label-sub">
          {artwork.medium}, {artwork.year}
        </span>
      </div>
    </div>
  );
}

function GalleryBench() {
  return (
    <div className="gallery-bench" aria-hidden>
      <div className="gallery-bench__shadow" />
      <SolidBox
        className="gallery-bench__leg gallery-bench__leg--a"
        w="34px"
        h="112px"
        d="130px"
        faceClass="gallery-bench__leg-face"
        faces={["front", "back", "left", "right"]}
      />
      <SolidBox
        className="gallery-bench__leg gallery-bench__leg--b"
        w="34px"
        h="112px"
        d="130px"
        faceClass="gallery-bench__leg-face"
        faces={["front", "back", "left", "right"]}
      />
      <SolidBox
        className="gallery-bench__seat"
        w="470px"
        h="46px"
        d="150px"
        faceClass="gallery-bench__seat-face"
        faces={["front", "back", "left", "right", "top"]}
      />
    </div>
  );
}
