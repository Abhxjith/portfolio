"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import MusicPlayerBar from "./MusicPlayerBar";

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
  if (!seconds || !Number.isFinite(seconds)) return "";
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

function getPreviousPlayableIndex(tracks: MusicTrack[], fromIndex: number) {
  for (let index = fromIndex - 1; index >= 0; index -= 1) {
    if (tracks[index]?.url) return index;
  }
  return null;
}

function getLastPlayableIndex(tracks: MusicTrack[]) {
  for (let index = tracks.length - 1; index >= 0; index -= 1) {
    if (tracks[index]?.url) return index;
  }
  return null;
}

function getRandomPlayableIndex(
  tracks: MusicTrack[],
  playableTrackIndexes: number[],
  excludeIndex?: number
) {
  const candidates = playableTrackIndexes.filter((index) => index !== excludeIndex);
  if (candidates.length === 0) return excludeIndex ?? playableTrackIndexes[0] ?? 0;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getInitialPlayableIndex(tracks: MusicTrack[]) {
  const index = tracks.findIndex((track) => Boolean(track.url));
  return index >= 0 ? index : 0;
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
  const playableTrackIndexes = useMemo(
    () => getPlayableTrackIndexes(tracks),
    [tracks]
  );
  const hasPlayableTracks = playableTrackIndexes.length > 0;
  const isPreRelease = !isAppleMusic && !hasPlayableTracks;

  const initialPlayableIndex = getInitialPlayableIndex(tracks);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeTrackIndexRef = useRef(initialPlayableIndex);
  const loadedUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(initialPlayableIndex);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [descriptionOverflows, setDescriptionOverflows] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [hoveredTrackIndex, setHoveredTrackIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [volume, setVolume] = useState(1);
  const shuffleRef = useRef(shuffle);
  const repeatRef = useRef(repeat);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  const measureDescriptionOverflow = useCallback(() => {
    if (!description) {
      setDescriptionOverflows(false);
      return;
    }

    if (descriptionExpanded) return;

    const element = descriptionRef.current;
    if (!element) return;

    if (isMobileLayout) {
      setDescriptionOverflows(
        element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
      );
      return;
    }

    setDescriptionOverflows(description.length > DESCRIPTION_PREVIEW_LENGTH);
  }, [description, descriptionExpanded, isMobileLayout]);

  const showDescriptionToggle = Boolean(description && descriptionOverflows);
  const descriptionPreview = description
    ? descriptionExpanded
      ? description
      : isMobileLayout
        ? description
        : description.length > DESCRIPTION_PREVIEW_LENGTH
          ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}...`
          : description
    : "";

  useLayoutEffect(() => {
    measureDescriptionOverflow();
  }, [measureDescriptionOverflow, descriptionPreview, isMobileLayout]);

  useEffect(() => {
    window.addEventListener("resize", measureDescriptionOverflow);
    return () => window.removeEventListener("resize", measureDescriptionOverflow);
  }, [measureDescriptionOverflow]);

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

  const resolvePlaybackIndex = useCallback(() => {
    if (tracks[activeTrackIndexRef.current]?.url) {
      return activeTrackIndexRef.current;
    }
    return playableTrackIndexes[0] ?? 0;
  }, [playableTrackIndexes, tracks]);

  const playTrack = useCallback(
    async (index: number) => {
      const audio = audioRef.current;
      const track = tracks[index];
      if (!audio || !track?.url) return;

      activeTrackIndexRef.current = index;
      setActiveTrackIndex(index);
      setCurrentTime(0);

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

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    },
    [tracks]
  );

  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!hasPlayableTracks) return;

    if (isPlaying) {
      pausePlayback();
      return;
    }

    await playTrack(resolvePlaybackIndex());
  }, [hasPlayableTracks, isPlaying, pausePlayback, playTrack, resolvePlaybackIndex]);

  const toggleTrack = useCallback(
    async (index: number) => {
      if (!tracks[index]?.url) return;

      if (index === activeTrackIndexRef.current && isPlaying) {
        pausePlayback();
        return;
      }
      await playTrack(index);
    },
    [isPlaying, pausePlayback, playTrack, tracks]
  );

  const shufflePlay = useCallback(async () => {
    if (playableTrackIndexes.length === 0) return;
    setShuffle(true);
    const randomIndex = getRandomPlayableIndex(
      tracks,
      playableTrackIndexes,
      activeTrackIndexRef.current
    );
    await playTrack(randomIndex);
  }, [playTrack, playableTrackIndexes, tracks]);

  const playPrevious = useCallback(async () => {
    if (!hasPlayableTracks) return;
    const previousIndex = getPreviousPlayableIndex(
      tracks,
      activeTrackIndexRef.current
    );
    if (previousIndex !== null) {
      await playTrack(previousIndex);
      return;
    }
    if (repeatRef.current === "all") {
      const lastIndex = getLastPlayableIndex(tracks);
      if (lastIndex !== null) await playTrack(lastIndex);
    }
  }, [hasPlayableTracks, playTrack, tracks]);

  const playNext = useCallback(async () => {
    if (!hasPlayableTracks) return;

    if (shuffleRef.current) {
      const randomIndex = getRandomPlayableIndex(
        tracks,
        playableTrackIndexes,
        activeTrackIndexRef.current
      );
      await playTrack(randomIndex);
      return;
    }

    const nextIndex = getNextPlayableIndex(tracks, activeTrackIndexRef.current);
    if (nextIndex !== null) {
      await playTrack(nextIndex);
      return;
    }

    if (repeatRef.current === "all") {
      const firstIndex = playableTrackIndexes[0];
      if (firstIndex !== undefined) await playTrack(firstIndex);
    }
  }, [hasPlayableTracks, playTrack, playableTrackIndexes, tracks]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => !value);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat((mode) => {
      if (mode === "off") return "all";
      if (mode === "all") return "one";
      return "off";
    });
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const audio = audioRef.current;
    setVolume(nextVolume);
    if (audio) audio.volume = nextVolume;
  }, []);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
    };
  }, []);

  useEffect(() => {
    if (isAppleMusic || !hasPlayableTracks) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatRef.current === "one") {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          setCurrentTime(0);
          void audio.play();
        }
        return;
      }

      if (shuffleRef.current) {
        const randomIndex = getRandomPlayableIndex(
          tracks,
          playableTrackIndexes,
          activeTrackIndexRef.current
        );
        void playTrack(randomIndex);
        return;
      }

      const nextIndex = getNextPlayableIndex(
        tracks,
        activeTrackIndexRef.current
      );
      if (nextIndex !== null) {
        void playTrack(nextIndex);
        return;
      }

      if (repeatRef.current === "all") {
        const firstIndex = playableTrackIndexes[0];
        if (firstIndex !== undefined) {
          void playTrack(firstIndex);
          return;
        }
      }

      setIsPlaying(false);
      setCurrentTime(0);
      const firstPlayable = playableTrackIndexes[0] ?? 0;
      activeTrackIndexRef.current = firstPlayable;
      setActiveTrackIndex(firstPlayable);
    };

    const handlePause = () => {
      if (audio.ended) return;
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDurations((prev) => ({
          ...prev,
          [activeTrackIndexRef.current]: audio.duration,
        }));
      }
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [hasPlayableTracks, isAppleMusic, playTrack, playableTrackIndexes, tracks]);

  useEffect(() => {
    if (isAppleMusic || !hasPlayableTracks) return;
    const audio = audioRef.current;
    const firstPlayableIndex = playableTrackIndexes[0];
    const firstUrl =
      firstPlayableIndex !== undefined
        ? tracks[firstPlayableIndex]?.url
        : undefined;
    if (!audio || !firstUrl) return;
    audio.src = firstUrl;
    audio.volume = volume;
    loadedUrlRef.current = firstUrl;
    activeTrackIndexRef.current = firstPlayableIndex;
    setActiveTrackIndex(firstPlayableIndex);
    audio.load();
  }, [hasPlayableTracks, isAppleMusic, playableTrackIndexes, tracks]);

  useEffect(() => {
    if (isAppleMusic || !hasPlayableTracks) return;

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
  }, [hasPlayableTracks, isAppleMusic, playableTrackIndexes, tracks, volume]);

  const activeDuration =
    durations[activeTrackIndex] ??
    (audioRef.current?.duration && Number.isFinite(audioRef.current.duration)
      ? audioRef.current.duration
      : 0);

  return (
    <div className="music-detail-player">
      <div className="music-detail-hero">
        <div className="music-detail-artwork-col">
          <div className="music-detail-artwork">
            <img src={artworkUrl} alt={`${title} artwork`} />
          </div>
        </div>

        <div className="music-detail-meta-col">
          <div className="music-detail-title-row">
            <h1 className="music-detail-album-title">{title}</h1>
          </div>
          {metaParts.length > 0 && (
            <p className="music-detail-meta-line">{metaParts.join(" · ")}</p>
          )}

          {description && (
            <div
              className={`music-detail-description-wrap ${descriptionExpanded ? "music-detail-description-wrap--expanded" : ""}`}
            >
              <div className="music-detail-description-line">
                <p ref={descriptionRef} className="music-detail-description">
                  {descriptionPreview}
                </p>
                {isMobileLayout && showDescriptionToggle && !descriptionExpanded && (
                  <button
                    type="button"
                    className="music-detail-more-btn music-detail-more-btn--inline"
                    onClick={() => setDescriptionExpanded(true)}
                  >
                    more
                  </button>
                )}
              </div>
              {showDescriptionToggle && (!isMobileLayout || descriptionExpanded) && (
                <button
                  type="button"
                  className="music-detail-more-btn"
                  onClick={() => setDescriptionExpanded((value) => !value)}
                >
                  {descriptionExpanded ? (isMobileLayout ? "less" : "LESS") : "MORE"}
                </button>
              )}
            </div>
          )}

          {!isAppleMusic && (
            <div className="music-detail-actions">
              <button
                type="button"
                className="music-detail-action-btn music-detail-action-btn--primary"
                disabled={!hasPlayableTracks}
                onClick={() => void togglePlayback()}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              {tracks.length > 1 && (
                <button
                  type="button"
                  className="music-detail-action-btn"
                  disabled={!hasPlayableTracks}
                  onClick={() => void shufflePlay()}
                >
                  Shuffle
                </button>
              )}
            </div>
          )}
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
              const isActive = isPlayable && index === activeTrackIndex;
              const isActivePlaying = isActive && isPlaying;
              const isHovered = hoveredTrackIndex === index;
              const showPause = isPlayable && isHovered && isActivePlaying;
              const showPlay = isHovered && (!isPlayable || !isActivePlaying);
              const duration = isPlayable ? formatDuration(durations[index]) : "";

              return (
                <li key={`${track.title}-${index}`}>
                  <button
                    type="button"
                    className={`music-track-row ${!isPlayable ? "music-track-row--static" : ""} ${isActive ? "music-track-row--active" : ""}`}
                    onClick={() => {
                      if (isPlayable) void toggleTrack(index);
                    }}
                    onMouseEnter={() => setHoveredTrackIndex(index)}
                    onMouseLeave={() => setHoveredTrackIndex(null)}
                    aria-label={
                      isPlayable
                        ? isActivePlaying
                          ? `Pause ${track.title}`
                          : `Play ${track.title}`
                        : track.title
                    }
                  >
                    <span className="music-track-row-index">
                      {showPause ? (
                        <span className="music-track-row-control">
                          <PauseIcon />
                        </span>
                      ) : showPlay ? (
                        <span className="music-track-row-control music-track-row-control--play">
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
                    {duration && (
                      <span className="music-track-row-duration">{duration}</span>
                    )}
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
          <p>
            {isAppleMusic
              ? "Listen on Apple Music"
              : isPreRelease
                ? `${trackSummary} · coming soon`
                : trackSummary}
          </p>
        </div>
        <p className="music-detail-footer-legal">
          all license to me and whomsoever it may concern bc i cant recall all
          the samples. all non profit.
        </p>
        <p className="music-detail-footer-legal">© 2026 Abhijith</p>
      </footer>

      {!isAppleMusic && hasPlayableTracks && (
        <audio ref={audioRef} preload="metadata" />
      )}

      {!isAppleMusic && (
        <MusicPlayerBar
          albumTitle={title}
          artworkUrl={artworkUrl}
          trackTitle={tracks[activeTrackIndex]?.title ?? tracks[0]?.title ?? title}
          playbackDisabled={isPreRelease}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={activeDuration}
          shuffle={shuffle}
          repeat={repeat}
          volume={volume}
          onTogglePlay={() => void togglePlayback()}
          onPrevious={() => void playPrevious()}
          onNext={() => void playNext()}
          onSeek={seekTo}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onVolumeChange={handleVolumeChange}
        />
      )}
    </div>
  );
}
