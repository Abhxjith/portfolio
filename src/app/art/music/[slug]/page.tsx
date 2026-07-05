import { notFound } from "next/navigation";
import MusicAlbumPlayer from "@/components/MusicAlbumPlayer";
import MusicDetailBackButton from "@/components/MusicDetailBackButton";
import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export const dynamic = "force-dynamic";

type MusicDocument = {
  title: string;
  description?: string;
  genre?: string;
  year?: number;
  playbackSource?: string;
  appleMusicEmbedUrl?: string;
  explicit?: boolean;
  artwork?: unknown;
  tracks?: Array<{
    title?: string;
    explicit?: boolean;
    audioFile?: {
      asset?: {
        url?: string;
      };
    };
  }>;
};

export default async function MusicAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const album = await client.fetch<MusicDocument | null>(
    `*[_type == "music" && slug.current == $slug][0]{
      title,
      description,
      genre,
      year,
      explicit,
      playbackSource,
      appleMusicEmbedUrl,
      artwork,
      tracks[]{
        title,
        explicit,
        audioFile {
          asset->{
            url
          }
        }
      }
    }`,
    { slug }
  );

  if (!album?.artwork) {
    notFound();
  }

  const artworkUrl = urlFor(album.artwork).width(1000).url();
  const isAppleMusic =
    album.playbackSource === "appleMusic" && Boolean(album.appleMusicEmbedUrl);
  const tracks = (album.tracks ?? [])
    .filter((track) => track.title)
    .map((track) => ({
      title: track.title as string,
      url: track.audioFile?.asset?.url,
      explicit: Boolean(track.explicit),
    }));

  if (!isAppleMusic && tracks.length === 0) {
    notFound();
  }

  return (
    <div className="music-detail-page">
      <MusicDetailBackButton />

      <MusicAlbumPlayer
        title={album.title}
        description={album.description}
        genre={album.genre}
        year={album.year}
        explicit={Boolean(album.explicit)}
        artworkUrl={artworkUrl}
        tracks={tracks}
        appleMusicEmbedUrl={
          isAppleMusic ? album.appleMusicEmbedUrl : undefined
        }
      />
    </div>
  );
}
