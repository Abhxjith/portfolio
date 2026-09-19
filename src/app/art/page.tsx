import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import MusicSection from "@/components/MusicSection";
import ArtGallerySection from "@/components/ArtGallerySection";
import ArtBookSection from "@/components/ArtBookSection";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text";
import { client } from "../../sanity/lib/client";
import {
  listingBookCoverUrl,
  listingCoverUrl,
  listingThumbUrl,
} from "@/sanity/lib/image";
import { BOOK_TYPES } from "@/lib/bookTypes";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const dynamic = "force-dynamic";

const PLACEHOLDER_COVER = "/art-placeholder.svg";

type ArtProject = {
  _id: string;
  title: string;
  image?: SanityImageSource;
};

type ArtGalleryDoc = {
  _id: string;
  title: string;
  slug?: string;
  month?: string;
  year?: number;
  cover?: SanityImageSource;
};

type PdfBookDoc = {
  _id: string;
  title: string;
  slug?: string;
  bookType?: string;
  year?: number;
  pdfUrl?: string;
  cover?: SanityImageSource;
};

type MusicDocument = {
  _id: string;
  title: string;
  slug?: string;
  genre?: string;
  year?: number;
  explicit?: boolean;
  playbackSource?: string;
  appleMusicEmbedUrl?: string;
  artwork?: SanityImageSource;
  tracks?: Array<{
    title?: string;
    audioFile?: {
      asset?: {
        url?: string;
      };
    };
  }>;
};

export default async function ArtPage() {
  const [artData, galleryData, musicData, bookData] = await Promise.all([
    client.fetch<ArtProject[]>(`*[_type == "art"]{
        _id, title, image
    }`),
    client.fetch<ArtGalleryDoc[]>(
      `*[_type == "artGallery"] | order(coalesce(order, 999999) asc, _createdAt desc){
        _id,
        title,
        "slug": slug.current,
        month,
        year,
        cover
      }`
    ),
    client.fetch<MusicDocument[]>(
      `*[_type == "music"] | order(coalesce(order, 999999) asc, _createdAt desc){
        _id,
        title,
        "slug": slug.current,
        genre,
        year,
        explicit,
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
      }`
    ),
    client.fetch<PdfBookDoc[]>(
      `*[_type == "pdfBook"] | order(coalesce(order, 999999) asc, _createdAt desc){
        _id,
        title,
        "slug": slug.current,
        bookType,
        year,
        cover,
        "pdfUrl": pdf.asset->url
      }`
    ),
  ]);

  const galleryCards = galleryData.map((gallery) => ({
    id: gallery._id,
    slug: gallery.slug,
    title: gallery.title,
    month: gallery.month,
    year: gallery.year,
    coverUrl: gallery.cover
      ? listingCoverUrl(gallery.cover)
      : PLACEHOLDER_COVER,
  }));

  const artGalleries = [
    ...galleryCards,
    ...artData.map((project) => ({
      id: project._id,
      title: project.title,
      coverUrl: project.image
        ? listingCoverUrl(project.image)
        : PLACEHOLDER_COVER,
    })),
  ];

  const musicAlbums = musicData
    .map((album) => ({
      id: album._id,
      slug: album.slug ?? "",
      title: album.title,
      genre: album.genre,
      year: album.year,
      explicit: Boolean(album.explicit),
      playbackSource: album.playbackSource,
      appleMusicEmbedUrl: album.appleMusicEmbedUrl,
      artworkUrl: album.artwork ? listingCoverUrl(album.artwork) : "",
      artworkThumbUrl: album.artwork ? listingThumbUrl(album.artwork) : "",
      tracks: (album.tracks ?? [])
        .filter((track) => track.title)
        .map((track) => ({
          title: track.title as string,
          url: track.audioFile?.asset?.url,
        })),
    }))
    .filter((album) => {
      if (!album.slug || !album.artworkUrl) return false;
      if (album.playbackSource === "appleMusic") {
        return Boolean(album.appleMusicEmbedUrl);
      }
      return album.tracks.length > 0;
    });

  const books = bookData
    .map((book) => ({
      id: book._id,
      slug: book.slug ?? "",
      title: book.title,
      bookType: book.bookType ?? "other",
      bookTypeLabel:
        BOOK_TYPES.find((t) => t.value === book.bookType)?.title ?? "Book",
      year: book.year,
      pdfUrl: book.pdfUrl ?? "",
      coverUrl: book.cover ? listingBookCoverUrl(book.cover) : undefined,
    }))
    .filter((book) => book.slug && book.pdfUrl);

  const hasContent =
    artGalleries.length > 0 || musicAlbums.length > 0 || books.length > 0;

  if (!hasContent) {
    return (
      <ProjectPageTemplate
        title="art projects"
        subtitle="some things i have worked real hard on."
        projects={[]}
      />
    );
  }

  return (
    <div className="project-page-container art-page">
      <div className="project-page-header">
        <h1 className="project-page-title">
          <BlurredStagger text="art projects" animateOnce />
        </h1>
        <p className="project-page-subtitle">
          some things i have worked real hard on.
        </p>
      </div>

      <MusicSection albums={musicAlbums} priorityCount={1} />
      <ArtBookSection books={books} priorityCount={musicAlbums.length === 0 ? 1 : 0} />
      <ArtGallerySection
        galleries={artGalleries}
        priorityCount={
          musicAlbums.length === 0 && books.length === 0 ? 1 : 0
        }
      />
    </div>
  );
}
