import ArtBookCard, { type ArtBookPreview } from "@/components/ArtBookCard";

type ArtBookSectionProps = {
  books: ArtBookPreview[];
};

export default function ArtBookSection({ books }: ArtBookSectionProps) {
  if (books.length === 0) return null;

  return (
    <section className="art-projects-section" aria-label="PDF books">
      <div className="music-list">
        {books.map((book) => (
          <ArtBookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
