"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type MusicPlayerBarProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  volume: number;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onVolumeChange: (volume: number) => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function ControlButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`music-player-bar__btn ${active ? "music-player-bar__btn--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function MusicPlayerBar({
  isPlaying,
  currentTime,
  duration,
  shuffle,
  repeat,
  volume,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
}: MusicPlayerBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player-bar" role="region" aria-label="Music player">
      <div className="music-player-bar__seek-row">
        <span className="music-player-bar__time">{formatTime(currentTime)}</span>
        <div className="music-player-bar__seek-track">
          <div
            className="music-player-bar__seek-fill"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            className="music-player-bar__seek"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => onSeek(Number(event.target.value))}
            aria-label="Seek"
          />
        </div>
        <span className="music-player-bar__time">{formatTime(duration)}</span>
      </div>

      <div className="music-player-bar__controls">
        <div className="music-player-bar__group music-player-bar__group--left">
          <ControlButton
            label={shuffle ? "Disable shuffle" : "Enable shuffle"}
            onClick={onToggleShuffle}
            active={shuffle}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M2.5 4.5h4.1l1.4 1.4H2.5V4.5zm0 7h3.5L2.5 8.6V11.5zm11-7-3.2 3.2 1.1 1.1L15.5 4.5h-2zm-1.1 5.4-1.1 1.1L13.5 11.5h2l-3.2-3.1zM6.1 11.5 4.7 10.1 8.9 6h2.1l-4.9 5.5z" />
            </svg>
          </ControlButton>

          <ControlButton label="Previous track" onClick={onPrevious}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
              <path d="M3 4.5v9l8-5.25L3 4.5zm10 0v9h1.5v-9H13z" />
            </svg>
          </ControlButton>

          <ControlButton
            label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <rect x="5" y="4" width="3" height="12" rx="0.5" />
                <rect x="12" y="4" width="3" height="12" rx="0.5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M6 4.5v11l9-5.5L6 4.5z" />
              </svg>
            )}
          </ControlButton>

          <ControlButton label="Next track" onClick={onNext}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
              <path d="M15 4.5v9L7 8.25 15 4.5zM4.5 4.5v9H3v-9h1.5z" />
            </svg>
          </ControlButton>

          <ControlButton
            label={
              repeat === "one"
                ? "Repeat one"
                : repeat === "all"
                  ? "Repeat all"
                  : "Repeat off"
            }
            onClick={onToggleRepeat}
            active={repeat !== "off"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M3.5 5.5V3H2v3.5h3.5V5.5zm9 5V13h1.5v-3.5H10V10.5zM2 8a5.5 5.5 0 0 1 9.2-4.1l.9-.9A6.5 6.5 0 1 0 14 8h-1.5a5 5 0 1 1-8.3-3.7l1 .9A5.5 5.5 0 0 1 2 8zm11.5-2.5 2 2-2 2v-1.5H10v-1h3.5V5.5z" />
            </svg>
            {repeat === "one" && (
              <span className="music-player-bar__repeat-one">1</span>
            )}
          </ControlButton>
        </div>

        <div className="music-player-bar__logo" aria-hidden>
          <Image src="/logo.avif" alt="" width={22} height={22} />
        </div>

        <div className="music-player-bar__group music-player-bar__group--right">
          <div className="music-player-bar__volume">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M2 6.5h2.5L8 3.5v9L4.5 9.5H2v-3zm8.5 1.5a3.5 3.5 0 0 0 0-3 1 1 0 1 1 1.7-.7 5.5 5.5 0 0 1 0 4.4 1 1 0 1 1-1.7-.7z" />
            </svg>
            <input
              type="range"
              className="music-player-bar__volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
