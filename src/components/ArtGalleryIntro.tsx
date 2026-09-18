"use client";

import { useRef, useState } from "react";
import SpinningGalleryCuboid from "@/components/SpinningGalleryCuboid";
import GalleryRoomView, { type Artwork } from "@/components/GalleryRoomView";

type ArtGalleryIntroProps = {
  title: string;
  description: string;
  artworks?: Artwork[];
};

type GalleryPhase = "idle" | "entering" | "zooming" | "dissolving" | "inside";

const SPIN_MS = 18000;
const EASE = "cubic-bezier(0.4, 0.0, 0.2, 1)";
const ZOOM_MS = 1500;
const CROSSFADE_MS = 1450;

function readSpinYaw(cuboid: HTMLElement) {
  const anim = cuboid
    .getAnimations()
    .find(
      (a) => a instanceof CSSAnimation && a.animationName.includes("galleryCuboidSpin")
    );

  if (anim && typeof anim.currentTime === "number") {
    return (((anim.currentTime % SPIN_MS) / SPIN_MS) * 360 + 360) % 360;
  }

  return 0;
}

/**
 * Same spin direction. Front (0°) or back (180°) — whichever is closer
 * continuing forward, so the turn is always ≤ 180°.
 */
function nextFlatFacing(currentYaw: number) {
  const yaw = ((currentYaw % 360) + 360) % 360;
  const toFront = (360 - yaw) % 360;
  const toBack = (180 - yaw + 360) % 360;
  const useFront = toFront <= toBack;
  const remaining = useFront ? toFront : toBack;
  return {
    from: yaw,
    target: yaw + remaining,
    remaining,
    facingYaw: useFront ? 0 : 180,
  };
}

export default function ArtGalleryIntro({
  title,
  description,
  artworks,
}: ArtGalleryIntroProps) {
  const [phase, setPhase] = useState<GalleryPhase>("idle");
  const [spinning, setSpinning] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const cuboidRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);
  const roomWrapRef = useRef<HTMLDivElement>(null);

  async function startEnter() {
    if (phase !== "idle") return;

    const stage = stageRef.current;
    const slide = slideRef.current;
    const zoom = zoomRef.current;
    const cuboid = cuboidRef.current;
    if (!stage || !slide || !zoom || !cuboid) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rect = cuboid.getBoundingClientRect();
    const fromX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const fromY = rect.top + rect.height / 2 - window.innerHeight / 2;

    stage.classList.add("gallery-intro-stage--immersive");
    slide.style.transform = `translate(${fromX}px, ${fromY}px)`;
    zoom.style.transform = "scale(1)";
    zoom.style.opacity = "1";

    setPhase("entering");
    void slide.offsetWidth;

    if (reduceMotion) {
      setSpinning(false);
      cuboid.style.animation = "none";
      cuboid.style.transform = "rotateX(-14deg) rotateY(0deg)";
      slide.style.transform = "translate(0px, 0px)";
      setPhase("inside");
      return;
    }

    const { from, target, remaining, facingYaw } = nextFlatFacing(
      readSpinYaw(cuboid)
    );
    const faceMs = Math.max(520, Math.min(1100, 420 + remaining * 4));

    setSpinning(false);
    cuboid.style.animation = "none";
    cuboid.style.transform = `rotateX(-18deg) rotateY(${from}deg)`;
    void cuboid.offsetWidth;

    const centerAnim = slide.animate(
      [
        { transform: `translate(${fromX}px, ${fromY}px)` },
        { transform: "translate(0px, 0px)" },
      ],
      { duration: faceMs, easing: EASE, fill: "forwards" }
    );
    const faceAnim = cuboid.animate(
      [
        { transform: `rotateX(-18deg) rotateY(${from}deg)` },
        { transform: `rotateX(-14deg) rotateY(${target}deg)` },
      ],
      { duration: faceMs, easing: EASE, fill: "forwards" }
    );

    await faceAnim.finished;
    try {
      centerAnim.finish();
    } catch {
      /* ignore */
    }

    slide.style.transform = "translate(0px, 0px)";
    cuboid.style.transform = `rotateX(-14deg) rotateY(${facingYaw}deg)`;

    const face = cuboid.querySelector(
      ".gallery-cuboid-face--front"
    ) as HTMLElement | null;
    const faceRect = (face ?? cuboid).getBoundingClientRect();
    const fillScale =
      Math.max(
        window.innerWidth / Math.max(faceRect.width, 1),
        window.innerHeight / Math.max(faceRect.height, 1)
      ) * 1.12;

    const smoke = smokeRef.current;
    const room = roomWrapRef.current?.querySelector(
      ".gallery-room-view"
    ) as HTMLElement | null;

    // Drive the whole crossfade with WAAPI so React phase changes don't hitch
    const zoomAnim = zoom.animate(
      [
        { transform: "scale(1)", opacity: 1, filter: "blur(0px)" },
        {
          transform: `scale(${fillScale * 0.55})`,
          opacity: 0.7,
          filter: "blur(10px)",
          offset: 0.4,
        },
        {
          transform: `scale(${fillScale})`,
          opacity: 0,
          filter: "blur(30px)",
        },
      ],
      { duration: ZOOM_MS, easing: EASE, fill: "forwards" }
    );

    smoke?.animate(
      [
        { opacity: 0 },
        { opacity: 0.7, offset: 0.18 },
        { opacity: 0.55, offset: 0.55 },
        { opacity: 0 },
      ],
      { duration: CROSSFADE_MS, easing: EASE, fill: "forwards" }
    );

    // Room shows almost immediately under the blur — no waiting for a phase switch
    room?.animate(
      [
        { opacity: 0 },
        { opacity: 0.45, offset: 0.15 },
        { opacity: 1, offset: 0.55 },
        { opacity: 1 },
      ],
      { duration: CROSSFADE_MS, easing: EASE, fill: "forwards" }
    );

    stage.animate(
      [
        { opacity: 1 },
        { opacity: 0.4, offset: 0.35 },
        { opacity: 0 },
      ],
      { duration: ZOOM_MS * 0.85, easing: EASE, fill: "forwards" }
    );

    setPhase("zooming");
    // Mark dissolving right away so CSS doesn't fight the WAAPI opacities
    requestAnimationFrame(() => setPhase("dissolving"));

    await Promise.all([
      zoomAnim.finished,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, CROSSFADE_MS);
      }),
    ]);

    if (room) room.style.opacity = "1";
    if (smoke) smoke.style.opacity = "0";
    setPhase("inside");
  }

  function exitRoom() {
    if (phase !== "inside") return;

    const stage = stageRef.current;
    const slide = slideRef.current;
    const zoom = zoomRef.current;
    const cuboid = cuboidRef.current;
    const smoke = smokeRef.current;
    const room =
      roomWrapRef.current?.querySelector<HTMLElement>(".gallery-room-view");

    // Cancel every WAAPI animation (fill: forwards persists otherwise),
    // then clear the inline styles startEnter left behind.
    [stage, slide, zoom, cuboid, smoke, room].forEach((el) => {
      el?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    });

    stage?.classList.remove("gallery-intro-stage--immersive");
    if (slide) slide.style.cssText = "";
    if (zoom) zoom.style.cssText = "";
    if (cuboid) cuboid.style.cssText = "";
    if (smoke) smoke.style.opacity = "0";
    if (room) room.style.opacity = "";

    setSpinning(true);
    setPhase("idle");
  }

  return (
    <div className={`gallery-intro gallery-intro--${phase}`}>
      <div className="gallery-intro-copy">
        <h1 className="gallery-intro-title">{title}</h1>
        <p className="gallery-intro-description">{description}</p>
        <button
          type="button"
          className="gallery-intro-cta"
          disabled={phase !== "idle"}
          onClick={startEnter}
        >
          Start Now
        </button>
      </div>

      <div className="gallery-room-portal" ref={roomWrapRef}>
        <GalleryRoomView
          artworks={artworks}
          active={
            phase === "entering" ||
            phase === "zooming" ||
            phase === "dissolving" ||
            phase === "inside"
          }
        />
      </div>

      <div className="gallery-enter-smoke" ref={smokeRef} aria-hidden />

      <div className="gallery-intro-stage" ref={stageRef}>
        <div className="gallery-cuboid-slide" ref={slideRef}>
          <div className="gallery-cuboid-zoom" ref={zoomRef}>
            <SpinningGalleryCuboid ref={cuboidRef} spinning={spinning} />
          </div>
        </div>
      </div>

      {phase === "inside" && (
        <>
          <button
            type="button"
            className="gallery-exit"
            onClick={exitRoom}
            aria-label="Exit gallery"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Exit
          </button>
          <p className="gallery-inside-hint gallery-inside-hint--visible">
            drag to look around
          </p>
        </>
      )}
    </div>
  );
}
