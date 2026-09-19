"use client";

type BookCoverPreviewProps = {
  coverUrl?: string;
  width?: number;
  height?: number;
  /** Mobile single-page mode — no fake 2-page shell */
  portrait?: boolean;
};

/**
 * Boot cover preview.
 * Desktop: mirrors closed StPageFlip (2-page shell, cover on right, shifted).
 * Mobile: one centered page (matches usePortrait flipbook).
 */
export default function BookCoverPreview({
  coverUrl,
  width,
  height,
  portrait = false,
}: BookCoverPreviewProps) {
  const cover = coverUrl ? (
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
  );

  if (!width || !height) {
    return (
      <div
        className="pdf-book-shell pdf-book-shell--cover pdf-book-shell--preview"
        style={{ width: "min(72vw, 320px)", aspectRatio: "210 / 297" }}
      >
        <div className="pdf-book-shell__shadow" aria-hidden />
        <div className="pdf-book-shell__block pdf-book-preview">{cover}</div>
      </div>
    );
  }

  if (portrait) {
    return (
      <div
        className="pdf-book-shell pdf-book-shell--cover pdf-book-shell--preview"
        style={{ width, height, transition: "none" }}
      >
        <div className="pdf-book-shell__shadow" aria-hidden />
        <div className="pdf-book-shell__block pdf-book-preview">{cover}</div>
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
        {cover}
      </div>
    </div>
  );
}
