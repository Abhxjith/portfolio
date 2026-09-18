import { notFound } from "next/navigation";
import MusicDetailBackButton from "@/components/MusicDetailBackButton";
import PdfFlipbookClient from "@/components/PdfFlipbookClient";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

type BookDoc = {
  title?: string;
  pdfUrl?: string;
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
      "pdfUrl": pdf.asset->url
    }`,
    { slug },
  );

  if (!book?.pdfUrl || !book.title) {
    notFound();
  }

  return (
    <div className="pdf-book-page pdf-book-page--immersive">
      <MusicDetailBackButton className="pdf-book-back" />
      <PdfFlipbookClient pdfUrl={book.pdfUrl} title={book.title} />
    </div>
  );
}
