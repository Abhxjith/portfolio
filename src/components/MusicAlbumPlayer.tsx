"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MusicTrack = {
  title: string;
  url?: string;
};

type MusicAlbumPlayerProps = {
  title: string;
  description?: string;
  genre?: string;
  year?: number;
  artworkUrl: string;
  tracks: MusicTrack[];
  appleMusicEmbedUrl?: string;
};

const DESCRIPTION_PREVIEW_LENGTH = 200;

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3 2.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="3" y="2.5" width="2.5" height="9" rx="0.5" />
      <rect x="8.5" y="2.5" width="2.5" height="9" rx="0.5" />
    </svg>
  );
}

function PlayingBars() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="1" y="4" width="2.5" height="6" rx="0.5" />
      <rect x="5.75" y="2" width="2.5" height="10" rx="0.5" />
      <rect x="10.5" y="5" width="2.5" height="5" rx="0.5" />
    </svg>
  );
}

function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatTotalDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function waitForAudioReady(audio: HTMLAudioElement) {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Audio failed to load"));
    };
    const cleanup = () => {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
    };

    audio.addEventListener("canplay", onReady);
    audio.addEventListener("error", onError);
  });
}

function getPlayableTrackIndexes(tracks: MusicTrack[]) {
  return tracks.flatMap((track, index) => (track.url ? [index] : []));
}

function getNextPlayableIndex(tracks: MusicTrack[], fromIndex: number) {
  for (let index = fromIndex + 1; index < tracks.length; index += 1) {
    if (tracks[index]?.url) return index;
  }
  return null;
}

export default function MusicAlbumPlayer({
  title,
  description,
  genre,
  year,
  artworkUrl,
  tracks,
  appleMusicEmbedUrl,
}: MusicAlbumPlayerProps) {
  const isAppleMusic = Boolean(appleMusicEmbedUrl);
  const playableTrackIndexes = getPlayableTrackIndexes(tracks);
  const hasPlayableTracks = playableTrackIndexes.length > 0;
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeTrackIndexRef = useRef(0);
  const loadedUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [hoveredTrackIndex, setHoveredTrackIndex] = useState<number | null>(null);

  const showDescriptionToggle =
    description && description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionPreview = description
    ? descriptionExpanded || !showDescriptionToggle
      ? description
      : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}...`
    : "";

  const metaParts = [genre, year?.toString()].filter(Boolean);
  const totalDurationSeconds = Object.values(durations).reduce(
    (sum, value) => sum + value,
    0
  );
  const hasTotalDuration =
    playableTrackIndexes.length > 0 &&
    playableTrackIndexes.every((index) => durations[index] !== undefined) &&
    totalDurationSeconds > 0;
  const songCountLabel = `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}`;
  const trackSummary = hasTotalDuration
    ? `${songCountLabel}, ${formatTotalDuration(totalDurationSeconds)}`
    : songCountLabel;

  const playTrack = useCallback(async (index: number) => {
    const audio = audioRef.current;
    const track = tracks[index];
    if (!audio || !track?.url) return;

    activeTrackIndexRef.current = index;
    setActiveTrackIndex(index);

    const needsLoad = loadedUrlRef.current !== track.url;
    if (needsLoad) {
      audio.pause();
      audio.src = track.url;
      loadedUrlRef.current = track.url;
      audio.load();
      await waitForAudioReady(audio);
    }

    if (audio.duration && Number.isFinite(audio.duration)) {
      setDurations((prev) => ({ ...prev, [index]: audio.duration }));
    }

    await audio.play();
    setIsPlaying(true);
  }, [tracks]);

  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      pausePlayback();
      return;
    }
    await playTrack(activeTrackIndexRef.current);
  }, [isPlaying, pausePlayback, playTrack]);

  const toggleTrack = useCallback(
    async (index: number) => {
      if (index === activeTrackIndexRef.current && isPlaying) {
        pausePlayback();
        return;
      }
      await playTrack(index);
    },
    [isPlaying, pausePlayback, playTrack]
  );

  const shufflePlay = useCallback(async () => {
    if (playableTrackIndexes.length === 0) return;
    const randomIndex =
      playableTrackIndexes[
        Math.floor(Math.random() * playableTrackIndexes.length)
      ];
    await playTrack(randomIndex);
  }, [playTrack, playableTrackIndexes]);

  useEffect(() => {
    if (isAppleMusic) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = getNextPlayableIndex(
        tracks,
        activeTrackIndexRef.current
      );
      if (nextIndex !== null) {
        void playTrack(nextIndex);
        return;
      }
      setIsPlaying(false);
      const firstPlayable = playableTrackIndexes[0] ?? 0;
      activeTrackIndexRef.current = firstPlayable;
      setActiveTrackIndex(firstPlayable);
    };

    const handlePause = () => {
      if (audio.ended) return;
      setIsPlaying(false);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDurations((prev) => ({
          ...prev,
          [activeTrackIndexRef.current]: audio.duration,
        }));
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isAppleMusic, playTrack, playableTrackIndexes, tracks]);

  useEffect(() => {
    if (isAppleMusic) return;
    const audio = audioRef.current;
    const firstPlayableIndex = playableTrackIndexes[0];
    const firstUrl =
      firstPlayableIndex !== undefined
        ? tracks[firstPlayableIndex]?.url
        : undefined;
    if (!audio || !firstUrl) return;
    audio.src = firstUrl;
    loadedUrlRef.current = firstUrl;
    activeTrackIndexRef.current = firstPlayableIndex;
    setActiveTrackIndex(firstPlayableIndex);
    audio.load();
  }, [isAppleMusic, playableTrackIndexes, tracks]);

  useEffect(() => {
    if (isAppleMusic) return;

    const probes: HTMLAudioElement[] = [];

    tracks.forEach((track, index) => {
      if (!track.url) return;

      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = track.url;
      const handleMetadata = () => {
        if (probe.duration && Number.isFinite(probe.duration)) {
          setDurations((prev) => ({ ...prev, [index]: probe.duration }));
        }
      };
      probe.addEventListener("loadedmetadata", handleMetadata);
      probes.push(probe);
    });

    return () => {
      probes.forEach((probe) => {
        probe.src = "";
      });
    };
  }, [isAppleMusic, tracks]);

  return (
    <div className="music-detail-player">
      <div className="music-detail-hero">
        <div className="music-detail-artwork-col">
          <div className="music-detail-artwork">
            <img src={artworkUrl} alt={`${title} artwork`} />
          </div>
        </div>

        <div className="music-detail-meta-col">
          <h1 className="music-detail-album-title">{title}</h1>
          {metaParts.length > 0 && (
            <p className="music-detail-meta-line">{metaParts.join(" · ")}</p>
          )}

          {description && (
            <div className="music-detail-description-wrap">
              <p className="music-detail-description">{descriptionPreview}</p>
              {showDescriptionToggle && (
                <button
                  type="button"
                  className="music-detail-more-btn"
                  onClick={() => setDescriptionExpanded((value) => !value)}
                >
                  {descriptionExpanded ? "LESS" : "MORE"}
                </button>
              )}
            </div>
          )}

          <div className="music-detail-actions">
            {!isAppleMusic && hasPlayableTracks && (
              <>
                <button
                  type="button"
                  className="music-detail-action-btn music-detail-action-btn--primary"
                  onClick={() => void togglePlayback()}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                {playableTrackIndexes.length > 1 && (
                  <button
                    type="button"
                    className="music-detail-action-btn"
                    onClick={() => void shufflePlay()}
                  >
                    Shuffle
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isAppleMusic ? (
        <div className="music-apple-embed-wrap">
          <iframe
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            className="music-apple-embed"
            frameBorder="0"
            height="450"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src={appleMusicEmbedUrl}
            title={`${title} on Apple Music`}
          />
        </div>
      ) : (
        <div className="music-detail-tracklist">
          <ol className="music-track-list music-track-list--detail">
            {tracks.map((track, index) => {
            const isPlayable = Boolean(track.url);
            const isActive = index === activeTrackIndex;
            const isActivePlaying = isActive && isPlaying;
            const isHovered = hoveredTrackIndex === index;
            const showPause = isPlayable && isHovered && isActivePlaying;
            const showPlay = isPlayable && isHovered && !isActivePlaying;

            if (!isPlayable) {
              return (
                <li key={`${track.title}-${index}`}>
                  <div className="music-track-row music-track-row--static">
                    <span className="music-track-row-index">
                      <span className="music-track-row-number">{index + 1}</span>
                    </span>
                    <span className="music-track-row-title">{track.title}</span>
                    <span className="music-track-row-duration">--:--</span>
                  </div>
                </li>
              );
            }

            return (
              <li key={`${track.title}-${index}`}>
                <button
                  type="button"
                  className={`music-track-row ${isActive ? "music-track-row--active" : ""}`}
                  onClick={() => void toggleTrack(index)}
                  onMouseEnter={() => setHoveredTrackIndex(index)}
                  onMouseLeave={() => setHoveredTrackIndex(null)}
                  aria-label={
                    isActivePlaying
                      ? `Pause ${track.title}`
                      : `Play ${track.title}`
                  }
                >
                  <span className="music-track-row-index">
                    {showPause ? (
                      <span className="music-track-row-control">
                        <PauseIcon />
                      </span>
                    ) : showPlay ? (
                      <span className="music-track-row-control">
                        <PlayIcon />
                      </span>
                    ) : isActivePlaying ? (
                      <span className="music-track-row-playing">
                        <PlayingBars />
                      </span>
                    ) : (
                      <span className="music-track-row-number">{index + 1}</span>
                    )}
                  </span>
                  <span className="music-track-row-title">{track.title}</span>
                  <span className="music-track-row-duration">
                    {formatDuration(durations[index])}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        </div>
      )}

      <footer className="music-detail-footer">
        <div className="music-detail-footer-meta">
          {year && <p>{year}</p>}
          <p>{isAppleMusic ? "Listen on Apple Music" : trackSummary}</p>
        </div>
        <p className="music-detail-footer-legal">
          all license to me or whomsoever it may concern bc i dont remember some
          of the samples where i took it from. non profit.
        </p>
        <p className="music-detail-footer-legal">2026 copyright Abhijith</p>
      </footer>

      {!isAppleMusic && hasPlayableTracks && (
        <audio ref={audioRef} preload="metadata" />
      )}
    </div>
  );
}