"use client";

import Link from "next/link";
import MusicExplicitBadge from "@/components/MusicExplicitBadge";

export type MusicAlbumPreview = {
  id: string;
  slug: string;
  title: string;
  genre?: string;
  year?: number;
  explicit?: boolean;
  artworkUrl: string;
};

function formatAlbumMeta(genre?: string, year?: number) {
  return [genre, year?.toString()].filter(Boolean).join(" · ");
}

type MusicAlbumCardProps = {
  album: MusicAlbumPreview;
};

export default function MusicAlbumCard({ album }: MusicAlbumCardProps) {
  return (
    <article className="music-album-item">
      <Link
        href={`/art/music/${album.slug}`}
        className="music-vinyl-stage"
        aria-label={`Open ${album.title}`}
      >
        <div className="music-vinyl-disc" aria-hidden>
          <div className="music-vinyl-disc-inner">
            <div
              className="music-vinyl-label"
              style={{ backgroundImage: `url(${album.artworkUrl})` }}
            />
          </div>
        </div>

        <div className="music-sleeve">
          <img src={album.artworkUrl} alt={`${album.title} artwork`} />
        </div>
      </Link>

      <div className="music-album-info">
        <div className="music-album-title-row">
          <Link href={`/art/music/${album.slug}`} className="music-album-title-link">
            <h3 className="music-album-title">{album.title}</h3>
          </Link>
          {album.explicit && <MusicExplicitBadge size="sm" />}
        </div>
        {formatAlbumMeta(album.genre, album.year) && (
          <p className="music-album-meta">
            {formatAlbumMeta(album.genre, album.year)}
          </p>
        )}
      </div>
    </article>
  );
}
