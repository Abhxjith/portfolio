import { notFound } from "next/navigation";
import imageUrlBuilder from "@sanity/image-url";
import ArtGalleryIntro from "@/components/ArtGalleryIntro";
import MusicDetailBackButton from "@/components/MusicDetailBackButton";
import { client } from "@/sanity/lib/client";
import type { Artwork } from "@/components/GalleryRoomView";

export const dynamic = "force-dynamic";

const builder = imageUrlBuilder(client);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function urlFor(source: any) {
  return builder.image(source);
}

// Demo room shown until a real gallery exists in Sanity
const FALLBACK_GALLERIES: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "untitled-room": {
    title: "The Art Gallery Title",
    description:
      "hey, my name is Abhijith and i make silly mobile apps, i have experience with frontend and backend development for web, app and chrome extensions. i like making things from scratch, whether it be branding to UI UX to coding, i like to do it all.",
  },
};

type GalleryArtworkDoc = {
  _key?: string;
  title?: string;
  year?: string;
  medium?: string;
  note?: string;
  aspect?: "wide" | "tall" | "square";
  framed?: boolean;
  image?: unknown;
};

type GalleryDoc = {
  title?: string;
  description?: string;
  artworks?: GalleryArtworkDoc[];
};

function toArtwork(doc: GalleryArtworkDoc, index: number): Artwork {
  return {
    id: doc._key ?? `artwork-${index}`,
    title: doc.title ?? "Untitled",
    year: doc.year ?? "",
    medium: doc.medium ?? "",
    note: doc.note ?? "",
    // Far wall (first piece) defaults to wide; the rest alternate
    aspect:
      doc.aspect ?? (index === 0 ? "wide" : index % 2 === 1 ? "tall" : "square"),
    framed: doc.framed !== false,
    imageUrl: doc.image ? urlFor(doc.image).width(1200).url() : undefined,
  };
}

export default async function ArtGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const gallery = await client.fetch<GalleryDoc | null>(
    `*[_type == "artGallery" && slug.current == $slug][0]{
      title,
      description,
      artworks[]{ _key, title, year, medium, note, aspect, framed, image }
    }`,
    { slug }
  );

  const fallback = FALLBACK_GALLERIES[slug];

  if (!gallery && !fallback) {
    notFound();
  }

  const title = gallery?.title ?? fallback?.title ?? "Untitled Room";
  const description = gallery?.description ?? fallback?.description ?? "";
  const artworks =
    gallery?.artworks && gallery.artworks.length > 0
      ? gallery.artworks.map(toArtwork)
      : undefined;

  return (
    <div className="gallery-intro-page">
      <MusicDetailBackButton className="gallery-detail-back" />
      <ArtGalleryIntro
        title={title}
        description={description}
        artworks={artworks}
      />
    </div>
  );
}
