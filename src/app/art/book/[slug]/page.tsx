import { notFound } from "next/navigation";
import MusicDetailBackButton from "@/components/MusicDetailBackButton";
import PdfFlipbookClient from "@/components/PdfFlipbookClient";
import { client } from "@/sanity/lib/client";
import { flipbookCoverUrl } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const dynamic = "force-dynamic";

type BookDoc = {
  title?: string;
  pdfUrl?: string;
  cover?: SanityImageSource;
};

export default async function ArtBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const book = await client.fetch<BookDoc | null>(
    `*[_type == "pdfBook" && slug.current == $slug][0]{
      title,
      cover,
      "pdfUrl": pdf.asset->url
    }`,
    { slug },
  );

  if (!book?.pdfUrl || !book.title) {
    notFound();
  }

  const coverUrl = book.cover ? flipbookCoverUrl(book.cover) : undefined;

  return (
    <>
      {coverUrl ? <link rel="preload" as="image" href={coverUrl} /> : null}
      <link rel="prefetch" href={book.pdfUrl} as="fetch" crossOrigin="anonymous" />
      <div className="pdf-book-page pdf-book-page--immersive">
        <MusicDetailBackButton className="pdf-book-back" />
        <PdfFlipbookClient
          pdfUrl={book.pdfUrl}
          title={book.title}
          coverUrl={coverUrl}
        />
      </div>
    </>
  );
}
