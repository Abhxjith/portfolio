import ArtBookCard, { type ArtBookPreview } from "@/components/ArtBookCard";

type ArtBookSectionProps = {
  books: ArtBookPreview[];
  priorityCount?: number;
};

export default function ArtBookSection({
  books,
  priorityCount = 0,
}: ArtBookSectionProps) {
  if (books.length === 0) return null;

  return (
    <section className="art-projects-section" aria-label="PDF books">
      <div className="music-list">
        {books.map((book, index) => (
          <ArtBookCard
            key={book.id}
            book={book}
            priority={index < priorityCount}
          />
        ))}
      </div>
    </section>
  );
}
