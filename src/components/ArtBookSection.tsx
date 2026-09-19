"use client";

import { useEffect } from "react";
import ArtBookCard, { type ArtBookPreview } from "@/components/ArtBookCard";
import { prefetchPdfBook, warmPdfRuntime } from "@/lib/pdfBookLoader";

type ArtBookSectionProps = {
  books: ArtBookPreview[];
  priorityCount?: number;
};

export default function ArtBookSection({
  books,
  priorityCount = 0,
}: ArtBookSectionProps) {
  useEffect(() => {
    warmPdfRuntime();
    // Prefetch the first few PDFs so opening a book isn't a cold start
    books.slice(0, 3).forEach((book) => {
      if (book.pdfUrl) prefetchPdfBook(book.pdfUrl);
    });
  }, [books]);

  if (books.length === 0) return null;

  return (
    <section className="art-projects-section" aria-label="PDF books">
      <div className="music-list">
        {books.map((book, index) => (
          <ArtBookCard
            key={book.id}
            book={book}
            priority={index < priorityCount}
          />
        ))}
      </div>
    </section>
  );
}
