"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BlurredStagger } from "./ui/blurred-stagger-text";

const STORAGE_KEY = "loading-screen-seen";
const MIN_DISPLAY_MS = 2200;
const SLIDE_DURATION_MS = 1000;

export default function LoadingScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"show" | "slide">("show");
  const [visible, setVisible] = useState(true);
  const [showOnce, setShowOnce] = useState<boolean | null>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem(STORAGE_KEY)) {
      setShowOnce(false);
      setVisible(false);
      document.body.classList.add("loading-done");
      document.body.classList.remove("loading");
      return;
    }
    setShowOnce(true);
  }, []);

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
        localStorage.setItem(STORAGE_KEY, "1");
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
        <h1 className="loading-screen__text">
          {phase === "show" && <BlurredStagger text="Hello." />}
          {phase === "slide" && <span>Hello.</span>}
        </h1>
      </div>
    </div>
  );
}
