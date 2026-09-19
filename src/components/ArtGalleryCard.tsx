"use client";

import Link from "next/link";
import CoverImage from "@/components/CoverImage";

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
  priority?: boolean;
};

export default function ArtGalleryCard({
  gallery,
  priority = false,
}: ArtGalleryCardProps) {
  const href = gallery.slug ? `/art/gallery/${gallery.slug}` : undefined;

  const sleeve = (
    <div className="music-sleeve">
      <CoverImage
        src={gallery.coverUrl}
        alt={href ? `${gallery.title} cover` : ""}
        priority={priority}
      />
    </div>
  );

  return (
    <article className="music-album-item">
      <p className="art-card-heading">art</p>
      {href ? (
        <Link
          href={href}
          className="music-vinyl-stage"
          aria-label={`Open ${gallery.title}`}
        >
          {sleeve}
        </Link>
      ) : (
        <div className="music-vinyl-stage art-gallery-stage" aria-hidden>
          {sleeve}
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
