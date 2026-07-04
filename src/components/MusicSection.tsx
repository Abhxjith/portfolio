import MusicAlbumCard, { type MusicAlbumPreview } from "@/components/MusicAlbumCard";

type MusicSectionProps = {
  albums: MusicAlbumPreview[];
};

export default function MusicSection({ albums }: MusicSectionProps) {
  if (albums.length === 0) return null;

  return (
    <section className="music-section" aria-label="Music">
      <h2 className="music-section-heading">music</h2>
      <div className="music-list">
        {albums.map((album) => (
          <MusicAlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
