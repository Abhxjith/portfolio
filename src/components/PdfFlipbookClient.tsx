"use client";

import nextDynamic from "next/dynamic";

const PdfFlipbook = nextDynamic(() => import("@/components/PdfFlipbook"), {
  ssr: false,
  loading: () => (
    <div className="pdf-flipbook-status" role="status">
      Loading flipbook…
    </div>
  ),
});

type PdfFlipbookClientProps = {
  pdfUrl: string;
  title: string;
};

export default function PdfFlipbookClient({
  pdfUrl,
  title,
}: PdfFlipbookClientProps) {
  return <PdfFlipbook pdfUrl={pdfUrl} title={title} />;
}
