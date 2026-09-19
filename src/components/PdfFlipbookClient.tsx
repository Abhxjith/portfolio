"use client";

import { useEffect, useState } from "react";
import PdfFlipbook from "@/components/PdfFlipbook";
import BookCoverPreview from "@/components/BookCoverPreview";
import {
  measureBookPageSize,
  prefetchPdfBook,
  type BookPageSize,
} from "@/lib/pdfBookLoader";

export default function PdfFlipbookClient({
  pdfUrl,
  title,
  coverUrl,
}: {
  pdfUrl: string;
  title: string;
  coverUrl?: string;
}) {
  const [size, setSize] = useState<BookPageSize | null>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSize(measureBookPageSize());
    setInteractive(false);
    // Start PDF bytes immediately — don't wait for layout
    prefetchPdfBook(pdfUrl);

    const onResize = () => setSize(measureBookPageSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pdfUrl]);

  // With a Sanity cover, flipbook can mount as soon as size is known
  const showLive = Boolean(size);

  return (
    <div className="pdf-flipbook-boot">
      <div
        className={`pdf-flipbook-boot__preview${interactive ? " pdf-flipbook-boot__preview--done" : ""}`}
        aria-hidden={interactive}
      >
        <div className="pdf-flipbook pdf-flipbook--spread">
          <div className="pdf-flipbook__stage">
            {size ? (
              <BookCoverPreview
                coverUrl={coverUrl}
                width={size.w}
                height={size.h}
                portrait={size.portrait}
              />
            ) : (
              <div
                className="pdf-flipbook-status__skeleton"
                aria-hidden
                style={{ width: "min(72vw, 320px)" }}
              />
            )}
          </div>
        </div>
      </div>

      {size && showLive && (
        <div
          className={`pdf-flipbook-boot__live${interactive ? " pdf-flipbook-boot__live--on" : ""}`}
        >
          <PdfFlipbook
            pdfUrl={pdfUrl}
            title={title}
            coverUrl={coverUrl}
            initialSize={size}
            onInteractive={() => setInteractive(true)}
          />
        </div>
      )}
    </div>
  );
}
