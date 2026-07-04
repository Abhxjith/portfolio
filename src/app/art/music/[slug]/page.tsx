import Link from "next/link";
import { notFound } from "next/navigation";
import MusicAlbumPlayer from "@/components/MusicAlbumPlayer";
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
  artwork?: unknown;
  tracks?: Array<{
    title?: string;
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
      playbackSource,
      appleMusicEmbedUrl,
      artwork,
      tracks[]{
        title,
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
    }));

  if (!isAppleMusic && tracks.length === 0) {
    notFound();
  }

  return (
    <div className="music-detail-page">
      <Link href="/art" className="music-detail-back" aria-label="Back to art">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M11 4L6 9l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <MusicAlbumPlayer
        title={album.title}
        description={album.description}
        genre={album.genre}
        year={album.year}
        artworkUrl={artworkUrl}
        tracks={tracks}
        appleMusicEmbedUrl={
          isAppleMusic ? album.appleMusicEmbedUrl : undefined
        }
      />
    </div>
  );
}
