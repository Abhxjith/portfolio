import ArtGalleryCard, {
  type ArtGalleryPreview,
} from "@/components/ArtGalleryCard";

type ArtGallerySectionProps = {
  galleries: ArtGalleryPreview[];
  priorityCount?: number;
};

export default function ArtGallerySection({
  galleries,
  priorityCount = 0,
}: ArtGallerySectionProps) {
  if (galleries.length === 0) return null;

  return (
    <section className="art-projects-section" aria-label="Art galleries">
      <div className="music-list">
        {galleries.map((gallery, index) => (
          <ArtGalleryCard
            key={gallery.id}
            gallery={gallery}
            priority={index < priorityCount}
          />
        ))}
      </div>
    </section>
  );
}
