import ArtGalleryCard, {
  type ArtGalleryPreview,
} from "@/components/ArtGalleryCard";

type ArtGallerySectionProps = {
  galleries: ArtGalleryPreview[];
};

export default function ArtGallerySection({ galleries }: ArtGallerySectionProps) {
  if (galleries.length === 0) return null;

  return (
    <section className="art-projects-section" aria-label="Art galleries">
      <div className="music-list">
        {galleries.map((gallery) => (
          <ArtGalleryCard key={gallery.id} gallery={gallery} />
        ))}
      </div>
    </section>
  );
}
