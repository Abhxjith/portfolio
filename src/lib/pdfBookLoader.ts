"use client";

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;
const docPromises = new Map<string, Promise<import("pdfjs-dist").PDFDocumentProxy>>();
const pageCaches = new Map<string, string[]>();

export async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export function getCachedPages(pdfUrl: string): string[] | undefined {
  const pages = pageCaches.get(pdfUrl);
  return pages?.every(Boolean) ? pages : pages;
}

export function setCachedPage(pdfUrl: string, index: number, dataUrl: string, total: number) {
  let pages = pageCaches.get(pdfUrl);
  if (!pages || pages.length !== total) {
    pages = Array.from({ length: total }, () => "");
    pageCaches.set(pdfUrl, pages);
  }
  pages[index] = dataUrl;
}

export async function getPdfDocument(pdfUrl: string) {
  let pending = docPromises.get(pdfUrl);
  if (!pending) {
    pending = loadPdfjs().then((pdfjs) =>
      pdfjs.getDocument({
        url: pdfUrl,
        withCredentials: false,
        // Range requests → first page paints sooner
        disableAutoFetch: true,
        disableStream: false,
      }).promise,
    );
    docPromises.set(pdfUrl, pending);
    pending.catch(() => {
      docPromises.delete(pdfUrl);
    });
  }
  return pending;
}

/** Warm pdf.js + start downloading the PDF (call on book-card hover). */
export function prefetchPdfBook(pdfUrl: string) {
  if (!pdfUrl || typeof window === "undefined") return;
  void getPdfDocument(pdfUrl);
}

export function renderScaleForViewport(pageWidthCss: number): number {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
  // Target ~1x CSS width at capped DPR — much faster than fixed 1.55
  return Math.max(0.75, Math.min(1.25, (pageWidthCss * dpr) / 595));
}

/** Single page size for the flipbook (cover is one page; spread is 2× this wide). */
export function measureBookPageSize(stageWidth?: number) {
  const vw =
    stageWidth && stageWidth > 0
      ? stageWidth
      : typeof window !== "undefined"
        ? window.innerWidth
        : 1200;
  const vh = (typeof window !== "undefined" ? window.innerHeight : 800) - 72;
  const maxSpreadW = Math.min(vw * 0.8, 1080);
  const maxH = Math.min(vh * 0.8, 760);
  let pageW = maxSpreadW / 2;
  let pageH = pageW * (297 / 210);
  if (pageH > maxH) {
    pageH = maxH;
    pageW = pageH * (210 / 297);
  }
  return { w: Math.round(pageW), h: Math.round(pageH) };
}

export async function renderPdfPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  scale: number,
): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.82);
}
