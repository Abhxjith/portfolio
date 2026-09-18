"use client";

import { useEffect, useState } from "react";

type PdfFirstPageCoverProps = {
  pdfUrl: string;
  coverUrl?: string;
  alt: string;
  className?: string;
};

const coverCache = new Map<string, string>();

async function renderFirstPage(pdfUrl: string): Promise<string> {
  const cached = coverCache.get(pdfUrl);
  if (cached) return cached;

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ url: pdfUrl, withCredentials: false }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.4 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  coverCache.set(pdfUrl, dataUrl);
  return dataUrl;
}

export default function PdfFirstPageCover({
  pdfUrl,
  coverUrl,
  alt,
  className = "",
}: PdfFirstPageCoverProps) {
  const [src, setSrc] = useState(coverUrl || "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (coverUrl) {
      setSrc(coverUrl);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setSrc("");
    setFailed(false);

    renderFirstPage(pdfUrl)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, coverUrl]);

  if (failed && !src) {
    return (
      <div className={`pdf-book-cover pdf-book-cover--fallback ${className}`.trim()} aria-hidden>
        <span>PDF</span>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`pdf-book-cover pdf-book-cover--loading ${className}`.trim()} aria-hidden />
    );
  }

  return (
    <img
      className={`pdf-book-cover ${className}`.trim()}
      src={src}
      alt={alt}
      draggable={false}
    />
  );
}
