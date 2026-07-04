import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import MusicSection from "@/components/MusicSection";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text";
import { client } from "../../sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export const dynamic = "force-dynamic";

type ArtProject = {
  _id: string;
  title: string;
  description?: string;
  image?: unknown;
  link?: string;
};

type MusicDocument = {
  _id: string;
  title: string;
  slug?: string;
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

export default async function ArtPage() {
  const [artData, musicData] = await Promise.all([
    client.fetch<ArtProject[]>(`*[_type == "art"]{
        _id, title, description, image, link
    }`),
    client.fetch<MusicDocument[]>(
      `*[_type == "music"] | order(coalesce(order, 999999) asc, _createdAt desc){
        _id,
        title,
        "slug": slug.current,
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
      }`
    ),
  ]);

  const artProjects = artData.map((project) => ({
    id: project._id,
    title: project.title,
    description: project.description,
    imageUrl: project.image ? urlFor(project.image).width(600).url() : undefined,
    link: project.link,
  }));

  const musicAlbums = musicData
    .map((album) => ({
      id: album._id,
      slug: album.slug ?? "",
      title: album.title,
      genre: album.genre,
      year: album.year,
      playbackSource: album.playbackSource,
      appleMusicEmbedUrl: album.appleMusicEmbedUrl,
      artworkUrl: album.artwork
        ? urlFor(album.artwork).width(800).url()
        : "",
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

  const hasContent = artProjects.length > 0 || musicAlbums.length > 0;

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
    <div className="project-page-container">
      <div className="project-page-header">
        <h1 className="project-page-title">
          <BlurredStagger text="art projects" />
        </h1>
        <p className="project-page-subtitle">
          some things i have worked real hard on.
        </p>
      </div>

      <MusicSection albums={musicAlbums} />

      {artProjects.length > 0 && (
        <section className="art-projects-section" aria-label="Art projects">
          {musicAlbums.length > 0 && (
            <h2 className="music-section-heading">art</h2>
          )}
          <div className="project-list">
            {artProjects.map((project) => (
              <div key={project.id} className="project-list-card">
                <div className="project-list-image-placeholder">
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div className="project-list-info">
                  <h3 className="project-list-title">{project.title}</h3>
                  {project.description && (
                    <p className="project-list-description">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
