import MusicAlbumCard, { type MusicAlbumPreview } from "@/components/MusicAlbumCard";

type MusicSectionProps = {
  albums: MusicAlbumPreview[];
  priorityCount?: number;
};

export default function MusicSection({
  albums,
  priorityCount = 0,
}: MusicSectionProps) {
  if (albums.length === 0) return null;

  return (
    <section className="music-section" aria-label="Music">
      <div className="music-list">
        {albums.map((album, index) => (
          <MusicAlbumCard
            key={album.id}
            album={album}
            priority={index < priorityCount}
          />
        ))}
      </div>
    </section>
  );
}
