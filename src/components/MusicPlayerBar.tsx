"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type MusicPlayerBarProps = {
  albumTitle: string;
  artworkUrl: string;
  trackTitle: string;
  artistName?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  volume: number;
  playbackDisabled?: boolean;
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
  size = "md",
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`music-player-bar__btn music-player-bar__btn--${size} ${active ? "music-player-bar__btn--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function MusicPlayerBar({
  albumTitle,
  artworkUrl,
  trackTitle,
  artistName = "Abhijith",
  isPlaying,
  currentTime,
  duration,
  shuffle,
  repeat,
  volume,
  playbackDisabled = false,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
}: MusicPlayerBarProps) {
  const [mounted, setMounted] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const mobileBar = (
    <div className="music-player-bar__row music-player-bar__row--mobile">
      <div className="music-player-bar__mobile-art">
        <img src={artworkUrl} alt="" />
      </div>
      <p className="music-player-bar__mobile-title">{trackTitle}</p>
      <div className="music-player-bar__mobile-controls">
        <ControlButton
          label={isPlaying ? "Pause" : "Play"}
          onClick={onTogglePlay}
          size="lg"
          disabled={playbackDisabled}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
              <rect x="4.5" y="3.5" width="2.5" height="11" rx="0.4" />
              <rect x="11" y="3.5" width="2.5" height="11" rx="0.4" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
              <path d="M5.5 3.8v10.4l8.5-5.2L5.5 3.8z" />
            </svg>
          )}
        </ControlButton>
        <ControlButton label="Next track" onClick={onNext} disabled={playbackDisabled}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M12.5 3.5v9l-7-4.5 7-4.5zM3.5 3.5v9H3v-9h.5z" />
          </svg>
        </ControlButton>
      </div>
    </div>
  );

  return createPortal(
    <div className="music-player-bar-wrap">
      <div className="music-player-bar" role="region" aria-label="Music player">
        <div className="music-player-bar__row music-player-bar__row--desktop">
          <div className="music-player-bar__group music-player-bar__group--left">
            <ControlButton
              label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              onClick={onToggleShuffle}
              active={shuffle}
              disabled={playbackDisabled}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path
                  d="M2 4.5h3.4l1.2 1.2M2 10.5h2.9L2 7.8M11.5 4.5 9 7l1 .9M10.5 10.5l3-2.9M6.2 10.5 5 9.3 8.2 6h1.8L6.2 10.5z"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ControlButton>

            <ControlButton label="Previous track" onClick={onPrevious} disabled={playbackDisabled}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M3.5 3.5v9l7-4.5-7-4.5zm8 0v9H12v-9h-.5z" />
              </svg>
            </ControlButton>

            <ControlButton
              label={isPlaying ? "Pause" : "Play"}
              onClick={onTogglePlay}
              size="lg"
              disabled={playbackDisabled}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
                  <rect x="4.5" y="3.5" width="2.5" height="11" rx="0.4" />
                  <rect x="11" y="3.5" width="2.5" height="11" rx="0.4" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
                  <path d="M5.5 3.8v10.4l8.5-5.2L5.5 3.8z" />
                </svg>
              )}
            </ControlButton>

            <ControlButton label="Next track" onClick={onNext} disabled={playbackDisabled}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M12.5 3.5v9l-7-4.5 7-4.5zM3.5 3.5v9H3v-9h.5z" />
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
              disabled={playbackDisabled}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path
                  d="M4 5.5V3.5H2.5M11 9.5v2H12.5M2.5 7.5a5 5 0 0 1 8.3-3.7l.9-.9M12.5 7.5a5 5 0 0 1-8.3 3.7l-.9.9"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {repeat === "one" && (
                <span className="music-player-bar__repeat-one">1</span>
              )}
            </ControlButton>
          </div>

          <div
            className={`music-player-bar__center ${showTimeline && !playbackDisabled ? "music-player-bar__center--timeline" : ""}`}
            onMouseEnter={() => {
              if (!playbackDisabled) setShowTimeline(true);
            }}
            onMouseLeave={() => setShowTimeline(false)}
          >
            <div className="music-player-bar__track">
              <div className="music-player-bar__art">
                <img src={artworkUrl} alt="" />
              </div>
              <div className="music-player-bar__meta">
                <p className="music-player-bar__track-title">{trackTitle}</p>
                <p className="music-player-bar__track-subtitle">
                  {artistName} — {albumTitle}
                </p>
              </div>
            </div>

            <div className="music-player-bar__timeline">
              <span className="music-player-bar__time">{formatTime(currentTime)}</span>
              <div className="music-player-bar__timeline-track">
                <div
                  className="music-player-bar__timeline-fill"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  className="music-player-bar__timeline-input"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => onSeek(Number(event.target.value))}
                  aria-label="Seek"
                  disabled={playbackDisabled}
                />
              </div>
              <span className="music-player-bar__time">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="music-player-bar__spacer" aria-hidden />

          <div className="music-player-bar__group music-player-bar__group--right">
            <ControlButton label="More options" disabled>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
                <circle cx="3.5" cy="7.5" r="1.1" />
                <circle cx="7.5" cy="7.5" r="1.1" />
                <circle cx="11.5" cy="7.5" r="1.1" />
              </svg>
            </ControlButton>

            <ControlButton label="Lyrics" disabled>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path
                  d="M3.5 4.5c0-1 .8-1.8 1.8-1.8h4.9c1 0 1.8.8 1.8 1.8v3.2c0 1-.8 1.8-1.8 1.8H7.2L4.8 12v-2.5c-1 0-1.8-.8-1.8-1.8V4.5z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <path d="M6 6h3M6 8h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </ControlButton>

            <ControlButton label="Up next" disabled>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M3 4h9M3 7.5h9M3 11h5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
                <circle cx="11.5" cy="11" r="1.1" fill="currentColor" />
              </svg>
            </ControlButton>

            <ControlButton label="Output" disabled>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path
                  d="M7.5 2.5v10M5 5.5 7.5 3 10 5.5M4 9.5a4 4 0 0 0 7 0"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ControlButton>

            <div className="music-player-bar__volume-wrap">
              <ControlButton label="Volume" disabled={playbackDisabled}>
                {volume === 0 ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <path d="M2.5 6h2.2L7.5 3.5v8L4.7 9H2.5V6z" fill="currentColor" />
                    <path d="M11 6.5l2 2M13 6.5l-2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <path d="M2.5 6h2.2L7.5 3.5v8L4.7 9H2.5V6z" fill="currentColor" />
                    <path d="M10 5.5a2.8 2.8 0 0 1 0 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                )}
              </ControlButton>
              <div className="music-player-bar__volume-slider-wrap">
                <input
                  type="range"
                  className="music-player-bar__volume-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => onVolumeChange(Number(event.target.value))}
                  aria-label="Volume"
                  disabled={playbackDisabled}
                />
              </div>
            </div>
          </div>
        </div>
        {mobileBar}
      </div>
    </div>,
    document.body
  );
}
