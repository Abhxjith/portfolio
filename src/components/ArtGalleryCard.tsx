"use client";

import Link from "next/link";

export type ArtGalleryPreview = {
  id: string;
  slug?: string;
  title: string;
  month?: string;
  year?: number;
  coverUrl: string;
};

function formatGalleryMeta(month?: string, year?: number) {
  return [month, year?.toString()].filter(Boolean).join(" · ");
}

type ArtGalleryCardProps = {
  gallery: ArtGalleryPreview;
};

export default function ArtGalleryCard({ gallery }: ArtGalleryCardProps) {
  const href = gallery.slug ? `/art/gallery/${gallery.slug}` : undefined;

  return (
    <article className="music-album-item">
      <p className="art-card-heading">art</p>
      {href ? (
        <Link
          href={href}
          className="music-vinyl-stage"
          aria-label={`Open ${gallery.title}`}
        >
          <div className="music-sleeve">
            <img src={gallery.coverUrl} alt={`${gallery.title} cover`} />
          </div>
        </Link>
      ) : (
        <div className="music-vinyl-stage art-gallery-stage" aria-hidden>
          <div className="music-sleeve">
            <img src={gallery.coverUrl} alt="" />
          </div>
        </div>
      )}

      <div className="music-album-info">
        {href ? (
          <Link href={href} className="music-album-title-link">
            <h3 className="music-album-title">{gallery.title}</h3>
          </Link>
        ) : (
          <h3 className="music-album-title">{gallery.title}</h3>
        )}
        {formatGalleryMeta(gallery.month, gallery.year) && (
          <p className="music-album-meta">
            {formatGalleryMeta(gallery.month, gallery.year)}
          </p>
        )}
      </div>
    </article>
  );
}
