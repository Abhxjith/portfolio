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
import {
  getCachedPages,
  getPdfDocument,
  measureBookPageSize,
  renderPdfPage,
  renderScaleForViewport,
  setCachedPage,
} from "@/lib/pdfBookLoader";

type PdfFlipbookProps = {
  pdfUrl: string;
  title: string;
  coverUrl?: string;
  initialSize: { w: number; h: number };
  onInteractive?: () => void;
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
      <span className="pdf-flip-page__shade pdf-flip-page__shade--left" aria-hidden />
      <span className="pdf-flip-page__shade pdf-flip-page__shade--right" aria-hidden />
    </div>
  );
});

export default function PdfFlipbook({
  pdfUrl,
  coverUrl,
  initialSize,
  onInteractive,
}: PdfFlipbookProps) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const onInteractiveRef = useRef(onInteractive);
  onInteractiveRef.current = onInteractive;

  const [pages, setPages] = useState<string[]>(() => getCachedPages(pdfUrl) ?? []);
  const [pageCount, setPageCount] = useState(() => getCachedPages(pdfUrl)?.length ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(() => Boolean(getCachedPages(pdfUrl)?.[0]));
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  // Locked to the same size as the boot preview — avoids a big→small flash
  const [size, setSize] = useState(initialSize);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<"cover" | "open" | "back">("cover");
  const [layoutAnim, setLayoutAnim] = useState(false);
  const pageIndexRef = useRef(0);
  const sizeWRef = useRef(initialSize.w);
  sizeWRef.current = size.w;
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const goLayout = useCallback((next: "cover" | "open" | "back") => {
    setLayoutAnim(true);
    setLayout(next);
  }, []);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSize(initialSize);
    sizeWRef.current = initialSize.w;
  }, [initialSize.w, initialSize.h]);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  // Resize only — do not remeasure on ready (that caused the oversized flash)
  useEffect(() => {
    const onResize = () => {
      const next = measureBookPageSize(stageRef.current?.clientWidth);
      sizeWRef.current = next.w;
      setSize(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    revealedRef.current = false;
    setRevealed(false);
    const cached = getCachedPages(pdfUrl);
    if (cached?.[0]) {
      setPages([...cached]);
      setPageCount(cached.length);
      setReady(true);
    } else {
      setReady(false);
      setPages([]);
      setPageCount(0);
    }
    setError(null);
    setPageIndex(0);
    setLayoutAnim(false);
    setLayout("cover");
    pageIndexRef.current = 0;

    (async () => {
      try {
        const doc = await getPdfDocument(pdfUrl);
        if (cancelled) return;

        const total = doc.numPages;
        if (total < 1) {
          setError("empty");
          return;
        }

        setPageCount(total);
        const cachedPages = getCachedPages(pdfUrl);
        const slots =
          cachedPages?.length === total
            ? [...cachedPages]
            : Array.from({ length: total }, () => "");

        if (!slots[0] && coverUrl) {
          slots[0] = coverUrl;
          setPages([...slots]);
          setReady(true);
        } else if (slots[0]) {
          setPages([...slots]);
          setReady(true);
        } else {
          setPages([...slots]);
        }

        const scale = renderScaleForViewport(sizeWRef.current || 480);

        const order = [
          1,
          ...Array.from({ length: Math.min(3, total) }, (_, i) => i + 2).filter(
            (n) => n <= total,
          ),
          ...Array.from({ length: total }, (_, i) => i + 1).filter((n) => n > 4),
        ];
        const seen = new Set<number>();

        for (const n of order) {
          if (cancelled || seen.has(n)) continue;
          seen.add(n);
          const idx = n - 1;
          const existing = slots[idx];
          if (existing && existing.startsWith("data:")) continue;

          const page = await doc.getPage(n);
          const url = await renderPdfPage(page, scale);
          if (cancelled || !url) return;
          slots[idx] = url;
          setCachedPage(pdfUrl, idx, url, total);
          setPages([...slots]);
          if (idx === 0) setReady(true);
        }
      } catch {
        if (!cancelled) setError("load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, coverUrl]);

  // Reveal only after the closed-cover layout has painted at the correct size
  useEffect(() => {
    if (error) {
      setRevealed(true);
      onInteractiveRef.current?.();
      return;
    }
    if (!ready || pageCount === 0 || revealedRef.current) return;

    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || revealedRef.current) return;
        revealedRef.current = true;
        setRevealed(true);
        onInteractiveRef.current?.();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [ready, pageCount, error]);

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

  const coverShiftX =
    layout === "cover" ? -size.w / 2 : layout === "back" ? size.w / 2 : 0;

  const syncLayoutFromIndex = useCallback(
    (idx: number) => {
      if (idx <= 0) goLayout("cover");
      else if (pageCount > 1 && idx >= pageCount - 1) goLayout("back");
      else goLayout("open");
    },
    [pageCount, goLayout],
  );

  const onFlipState = useCallback(
    (e: { data: string }) => {
      if (e.data !== "flipping") return;
      const idx = pageIndexRef.current;
      if (idx === 0) {
        goLayout("open");
        return;
      }
      if (pageCount > 1 && idx >= pageCount - 1) {
        goLayout("open");
      }
    },
    [pageCount, goLayout],
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

  // Stay invisible under the boot preview until pages are ready
  if (!ready || pageCount === 0) {
    return (
      <div
        className="pdf-flipbook pdf-flipbook--spread"
        ref={stageRef}
        aria-hidden
        style={{ visibility: "hidden" }}
      />
    );
  }

  const toolbar =
    mounted &&
    revealed &&
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
            layoutAnim ? "pdf-book-shell--layout-anim" : "",
            layout === "cover"
              ? "pdf-book-shell--cover"
              : layout === "back"
                ? "pdf-book-shell--back"
                : "pdf-book-shell--open",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            transform: `translateX(${coverShiftX}px) scale(${zoom})`,
            // Only animate when the user actually flips — never on first paint
            transition: layoutAnim ? undefined : "none",
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
              maxWidth={720}
              minHeight={260}
              maxHeight={900}
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
                      // eslint-disable-next-line @next/next/no-img-element
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
