"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BlurredStagger } from "./ui/blurred-stagger-text";

const STORAGE_KEY = "loading-screen-seen";
const SLIDE_DURATION_MS = 1000;
const HELLO_ANIMATION_MS = 1000;
const GREETING_HOLD_MS = 350;

const GREETINGS = [
  { text: "Hello.", animate: true, lang: "en" },
  { text: "നമസ്കാരം.", animate: false, lang: "ml" },
  { text: "नमस्ते.", animate: false, lang: "hi" },
  { text: "नमस्कार.", animate: false, lang: "mr" },
  { text: "Hola.", animate: false, lang: "es" },
] as const;

const MIN_DISPLAY_MS =
  HELLO_ANIMATION_MS + (GREETINGS.length - 1) * GREETING_HOLD_MS + 400;

export default function LoadingScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"show" | "slide">("show");
  const [visible, setVisible] = useState(true);
  const [showOnce, setShowOnce] = useState<boolean | null>(null);
  const [greetingIndex, setGreetingIndex] = useState(0);

  const isHome = pathname === "/";
  const currentGreeting = GREETINGS[greetingIndex];

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem(STORAGE_KEY)) {
      setShowOnce(false);
      setVisible(false);
      document.body.classList.add("loading-done");
      document.body.classList.remove("loading");
      return;
    }
    setShowOnce(true);
  }, []);

  useEffect(() => {
    if (phase !== "show" || showOnce !== true) return;
    if (greetingIndex >= GREETINGS.length - 1) return;

    const delay =
      greetingIndex === 0 ? HELLO_ANIMATION_MS : GREETING_HOLD_MS;

    const timer = setTimeout(() => {
      setGreetingIndex((i) => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [greetingIndex, phase, showOnce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHome) {
      document.body.classList.add("loading-done");
      document.body.classList.remove("loading");
      return;
    }
    if (showOnce !== true) return;

    document.body.classList.add("loading");
    document.body.classList.remove("loading-done");

    let isLoaded = document.readyState === "complete";
    let isTimeUp = false;

    const checkDone = () => {
      if (isLoaded && isTimeUp) {
        document.body.classList.add("loading-done");
        document.body.classList.remove("loading");
        sessionStorage.setItem(STORAGE_KEY, "1");
        setPhase("slide");
        setTimeout(() => setVisible(false), SLIDE_DURATION_MS + 100);
      }
    };

    const handleLoad = () => {
      isLoaded = true;
      checkDone();
    };

    if (!isLoaded) window.addEventListener("load", handleLoad);
    const timer = setTimeout(() => {
      isTimeUp = true;
      checkDone();
    }, MIN_DISPLAY_MS);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, [isHome, showOnce]);

  if (showOnce !== true || !visible || !isHome) return null;

  return (
    <div
      className={`loading-screen ${phase === "slide" ? "loading-screen--exit" : ""}`}
      aria-hidden
    >
      <div className="loading-panel" />
      <div className="loading-panel" />
      <div className="loading-panel" />
      <div className="loading-panel" />
      <div className="loading-content">
        <h1
          className={`loading-screen__text loading-screen__text--${currentGreeting.lang}`}
        >
          {phase === "show" && currentGreeting.animate && (
            <BlurredStagger text={currentGreeting.text} />
          )}
          {phase === "show" && !currentGreeting.animate && (
            <span>{currentGreeting.text}</span>
          )}
          {phase === "slide" && <span>{currentGreeting.text}</span>}
        </h1>
      </div>
    </div>
  );
}
