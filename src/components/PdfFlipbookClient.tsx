"use client";

import { useEffect, useState, type ComponentType } from "react";
import BookCoverPreview from "@/components/BookCoverPreview";
import {
  measureBookPageSize,
  prefetchPdfBook,
  type BookPageSize,
} from "@/lib/pdfBookLoader";

type PdfFlipbookProps = {
  pdfUrl: string;
  title: string;
  coverUrl?: string;
  initialSize: BookPageSize;
  onInteractive?: () => void;
};

export default function PdfFlipbookClient({
  pdfUrl,
  title,
  coverUrl,
}: {
  pdfUrl: string;
  title: string;
  coverUrl?: string;
}) {
  const [Flipbook, setFlipbook] = useState<ComponentType<PdfFlipbookProps> | null>(
    null,
  );
  const [size, setSize] = useState<BookPageSize | null>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSize(measureBookPageSize());
    setInteractive(false);
    prefetchPdfBook(pdfUrl);
    let cancelled = false;
    void import("@/components/PdfFlipbook").then((mod) => {
      if (!cancelled) setFlipbook(() => mod.default);
    });

    const onResize = () => setSize(measureBookPageSize());
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [pdfUrl]);

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

      {Flipbook && size && (
        <div
          className={`pdf-flipbook-boot__live${interactive ? " pdf-flipbook-boot__live--on" : ""}`}
        >
          <Flipbook
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
