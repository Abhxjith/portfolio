import { client } from "../../../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url';
import { BlurredStagger } from "@/components/ui/blurred-stagger-text";
import { notFound } from 'next/navigation';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export const dynamic = 'force-dynamic';

export default async function UIUXProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const project = await client.fetch(`*[_type == "uiuxProject" && slug.current == $slug][0]{
        title, description, image1, textBlock1, image2, textBlock2, image3, video1, video2, liveLink
    }`, { slug });

    if (!project) {
        return notFound();
    }

    const images = [project.image1, project.image2, project.image3].filter(Boolean);
    const videos = [project.video1, project.video2].filter(Boolean);

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
                <h1 className="instrument-serif" style={{ fontSize: "4rem", color: "var(--text-primary)", letterSpacing: "-0.05em", margin: "0 0 16px 0", lineHeight: 1 }}>
                    <BlurredStagger text={project.title} />
                </h1>
                {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" style={{ color: "#FF3B30", textDecoration: "none", fontWeight: 500, fontSize: "1.2rem", display: "inline-block", marginTop: "12px" }}>
                        View Live Site ↗
                    </a>
                )}
            </div>

            <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "40px", textAlign: "justify", whiteSpace: "pre-wrap" }}>
                {project.description}
            </div>

            {videos.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginBottom: "40px" }}>
                    {videos.map((url: string, idx: number) => {
                        const videoId = getYouTubeId(url);
                        if (!videoId) return null;
                        return (
                            <div key={`video-${idx}`} style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "16px" }}>
                                <iframe
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "40px", marginBottom: "80px" }}>
                {project.image1 && (
                    <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
                        <img src={urlFor(project.image1).width(1200).url()} alt={`${project.title} Image 1`} style={{ width: "100%", height: "auto", display: "block" }} />
                    </div>
                )}

                {project.textBlock1 && (
                    <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, textAlign: "justify", whiteSpace: "pre-wrap" }}>
                        {project.textBlock1}
                    </div>
                )}

                {project.image2 && (
                    <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
                        <img src={urlFor(project.image2).width(1200).url()} alt={`${project.title} Image 2`} style={{ width: "100%", height: "auto", display: "block" }} />
                    </div>
                )}

                {project.textBlock2 && (
                    <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, textAlign: "justify", whiteSpace: "pre-wrap" }}>
                        {project.textBlock2}
                    </div>
                )}

                {project.image3 && (
                    <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
                        <img src={urlFor(project.image3).width(1200).url()} alt={`${project.title} Image 3`} style={{ width: "100%", height: "auto", display: "block" }} />
                    </div>
                )}
            </div>
        </div>
    );
}
