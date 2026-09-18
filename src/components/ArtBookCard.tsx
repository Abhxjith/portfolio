"use client";

import Link from "next/link";
import PdfFirstPageCover from "@/components/PdfFirstPageCover";

export type ArtBookPreview = {
  id: string;
  slug: string;
  title: string;
  bookType: string;
  bookTypeLabel: string;
  year?: number;
  pdfUrl: string;
  coverUrl?: string;
};

type ArtBookCardProps = {
  book: ArtBookPreview;
};

export default function ArtBookCard({ book }: ArtBookCardProps) {
  const href = `/art/book/${book.slug}`;
  const meta = [book.bookTypeLabel, book.year?.toString()].filter(Boolean).join(" · ");

  return (
    <article className="music-album-item">
      <p className="art-card-heading">book</p>
      <Link
        href={href}
        className="music-vinyl-stage art-book-stage"
        aria-label={`Open ${book.title}`}
      >
        <div className="music-sleeve art-book-sleeve">
          <PdfFirstPageCover
            pdfUrl={book.pdfUrl}
            coverUrl={book.coverUrl}
            alt={`${book.title} cover`}
          />
        </div>
      </Link>

      <div className="music-album-info">
        <Link href={href} className="music-album-title-link">
          <h3 className="music-album-title">{book.title}</h3>
        </Link>
        {meta && <p className="music-album-meta">{meta}</p>}
      </div>
    </article>
  );
}
