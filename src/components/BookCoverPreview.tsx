"use client";

type BookCoverPreviewProps = {
  coverUrl?: string;
  width?: number;
  height?: number;
};

/**
 * Mirrors the closed flipbook geometry: a 2-page-wide shell with the cover on
 * the right half, shifted by -w/2 so the cover sits centered — same as
 * PdfFlipbook’s cover layout. Transform is applied from the first paint
 * (never animated), so it doesn’t slide in from the side.
 */
export default function BookCoverPreview({
  coverUrl,
  width,
  height,
}: BookCoverPreviewProps) {
  if (!width || !height) {
    return (
      <div
        className="pdf-book-shell pdf-book-shell--cover pdf-book-shell--preview"
        style={{ width: "min(46vw, 420px)", aspectRatio: "210 / 297" }}
      >
        <div className="pdf-book-shell__shadow" aria-hidden />
        <div className="pdf-book-shell__block pdf-book-preview">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="pdf-book-preview__cover"
              draggable={false}
              fetchPriority="high"
            />
          ) : (
            <div
              className="pdf-flipbook-status__skeleton pdf-book-preview__skeleton"
              aria-hidden
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="pdf-book-shell pdf-book-shell--cover pdf-book-shell--preview"
      style={{
        width: width * 2,
        height,
        transform: `translateX(${-width / 2}px)`,
        transition: "none",
      }}
    >
      <div className="pdf-book-shell__shadow" aria-hidden />
      <div
        className="pdf-book-shell__block pdf-book-preview"
        style={{ width, height, marginLeft: width }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="pdf-book-preview__cover"
            draggable={false}
            fetchPriority="high"
          />
        ) : (
          <div
            className="pdf-flipbook-status__skeleton pdf-book-preview__skeleton"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
