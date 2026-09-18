"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import HTMLFlipBook from "react-pageflip";

type PdfFlipbookProps = {
  pdfUrl: string;
  title: string;
};

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
};

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.45;
const ZOOM_STEP = 0.15;

const Page = forwardRef<
  HTMLDivElement,
  { children: ReactNode; number: number; density: "hard" | "soft" }
>(function Page({ children, number, density }, ref) {
  return (
    <div
      className={`pdf-flip-page pdf-flip-page--${density}`}
      ref={ref}
      data-page={number}
      data-density={density}
    >
      {children}
      {/* Spine shading lives ON the page so it flips with it */}
      <span className="pdf-flip-page__shade pdf-flip-page__shade--left" aria-hidden />
      <span className="pdf-flip-page__shade pdf-flip-page__shade--right" aria-hidden />
    </div>
  );
});

async function renderPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  scale: number,
): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function PdfFlipbook({ pdfUrl }: PdfFlipbookProps) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1.08);
  const [size, setSize] = useState({ w: 340, h: 480 });
  const [mounted, setMounted] = useState(false);
  /** Layout mode for centering — updates at flip START so pages aren't clipped */
  const [layout, setLayout] = useState<"cover" | "open" | "back">("cover");
  const pageIndexRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    if (!ready || pageCount === 0) return;

    const measure = () => {
      const stage = stageRef.current;
      const vw = stage?.clientWidth || window.innerWidth;
      const vh = (stage?.clientHeight || window.innerHeight) - 72;
      const maxSpreadW = Math.min(vw * 0.94, 1280);
      const maxH = Math.min(vh * 0.9, 860);
      let pageW = maxSpreadW / 2;
      let pageH = pageW * (297 / 210);
      if (pageH > maxH) {
        pageH = maxH;
        pageW = pageH * (210 / 297);
      }
      setSize({ w: Math.round(pageW), h: Math.round(pageH) });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [ready, pageCount]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);
    setPages([]);
    setPageCount(0);
    setPageIndex(0);
    setLayout("cover");
    pageIndexRef.current = 0;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument({
          url: pdfUrl,
          withCredentials: false,
        }).promise;

        if (cancelled) return;
        const total = doc.numPages;
        if (total < 1) {
          setError("empty");
          return;
        }

        setPageCount(total);
        const slots = Array.from({ length: total }, () => "");
        setPages(slots);

        const first = await doc.getPage(1);
        const cover = await renderPage(first, 1.55);
        if (cancelled) return;
        slots[0] = cover;
        setPages([...slots]);
        setReady(true);

        for (let i = 2; i <= total; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const url = await renderPage(page, 1.45);
          if (cancelled) return;
          slots[i - 1] = url;
          setPages([...slots]);
        }
      } catch {
        if (!cancelled) setError("load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-" || e.key === "_") zoomOut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, zoomIn, zoomOut]);

  const bookKey = useMemo(
    () => `${pdfUrl}-${size.w}x${size.h}-${pageCount}`,
    [pdfUrl, size.w, size.h, pageCount],
  );

  // StPageFlip keeps the closed cover on the RIGHT half of a 2-page block.
  // Shift so the cover sits centered; when open, center the full spread.
  // `layout` is set at flip START (not end) so the left page isn't clipped
  // while the book is still in the cover-centered position.
  const coverShiftX =
    layout === "cover" ? -size.w / 2 : layout === "back" ? size.w / 2 : 0;

  const syncLayoutFromIndex = useCallback(
    (idx: number) => {
      if (idx <= 0) setLayout("cover");
      else if (pageCount > 1 && idx >= pageCount - 1) setLayout("back");
      else setLayout("open");
    },
    [pageCount],
  );

  const onFlipState = useCallback(
    (e: { data: string }) => {
      const state = e.data;
      if (
        state !== "flipping" &&
        state !== "user_fold" &&
        state !== "fold_corner"
      ) {
        return;
      }
      const idx = pageIndexRef.current;
      // Opening from front cover → make room for the left page immediately
      if (idx === 0) {
        setLayout("open");
        return;
      }
      // Closing onto back cover → stay open until flip finishes (handled in onFlip)
      // Opening from back cover toward spread
      if (pageCount > 1 && idx >= pageCount - 1) {
        setLayout("open");
      }
    },
    [pageCount],
  );

  const onFlipComplete = useCallback(
    (e: { data: number }) => {
      const idx = e.data;
      setPageIndex(idx);
      pageIndexRef.current = idx;
      syncLayoutFromIndex(idx);
    },
    [syncLayoutFromIndex],
  );

  if (error) {
    return (
      <div className="pdf-flipbook-status pdf-flipbook-status--error" role="alert">
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Open PDF">
          PDF
        </a>
      </div>
    );
  }

  if (!ready || pages.length === 0) {
    return <div className="pdf-flipbook-status" role="status" aria-label="Loading" />;
  }

  const toolbar =
    mounted &&
    createPortal(
      <div className="pdf-flipbook__bar" role="toolbar" aria-label="Book controls">
        <button type="button" onClick={flipPrev} aria-label="Previous page">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" onClick={zoomOut} aria-label="Zoom out" disabled={zoom <= ZOOM_MIN}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.75 8h4.5M12.5 12.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="pdf-flipbook__bar-meta" aria-live="polite">
          {pageIndex + 1}/{pageCount}
        </span>
        <button type="button" onClick={zoomIn} aria-label="Zoom in" disabled={zoom >= ZOOM_MAX}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5.75v4.5M5.75 8h4.5M12.5 12.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" onClick={flipNext} aria-label="Next page">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>,
      document.body,
    );

  return (
    <div className="pdf-flipbook pdf-flipbook--spread">
      <div className="pdf-flipbook__stage" ref={stageRef}>
        <div
          className={[
            "pdf-book-shell",
            layout === "cover"
              ? "pdf-book-shell--cover"
              : layout === "back"
                ? "pdf-book-shell--back"
                : "pdf-book-shell--open",
          ].join(" ")}
          style={{
            transform: `translateX(${coverShiftX}px) scale(${zoom})`,
          }}
        >
          <div className="pdf-book-shell__shadow" aria-hidden />
          <div className="pdf-book-shell__block">
            <HTMLFlipBook
              key={bookKey}
              ref={bookRef as never}
              width={size.w}
              height={size.h}
              size="fixed"
              minWidth={180}
              maxWidth={560}
              minHeight={260}
              maxHeight={850}
              showCover
              mobileScrollSupport
              drawShadow
              flippingTime={850}
              usePortrait={false}
              startPage={0}
              maxShadowOpacity={0.8}
              className="pdf-flipbook__book"
              style={{ background: "transparent" }}
              startZIndex={0}
              autoSize={false}
              clickEventForward
              useMouseEvents
              swipeDistance={40}
              showPageCorners
              disableFlipByClick={false}
              onChangeState={onFlipState}
              onFlip={onFlipComplete}
            >
              {pages.map((src, i) => {
                const density =
                  i === 0 || i === pages.length - 1 ? "hard" : "soft";
                return (
                  <Page key={i} number={i + 1} density={density}>
                    {src ? (
                      <img src={src} alt="" draggable={false} />
                    ) : (
                      <div className="pdf-flip-page__loading" aria-hidden />
                    )}
                  </Page>
                );
              })}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
      {toolbar}
    </div>
  );
}
