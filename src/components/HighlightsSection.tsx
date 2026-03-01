"use client";

import { useState, useEffect, useCallback } from "react";
import { BlurredStagger } from "./ui/blurred-stagger-text";
import { client } from "../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
    return builder.image(source)
}

interface Highlight {
    _id: string;
    title: string;
    mediaType: 'image' | 'video';
    image?: any;
    videoUrl?: string;
    videoFile?: {
        asset: {
            url: string;
        }
    };
    link?: string;
}

// Helper to chunk the projects into groups of 2 (1 row x 2 cols)
const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
};

export default function HighlightsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [highlights, setHighlights] = useState<Highlight[]>([]);

    useEffect(() => {
        const fetchHighlights = async () => {
            const data = await client.fetch(`*[_type == "highlight"] | order(_createdAt desc){
                _id,
                title,
                mediaType,
                image,
                videoUrl,
                videoFile {
                    asset->{
                        url
                    }
                },
                link
            }`);
            setHighlights(data);
        };
        fetchHighlights();
    }, []);

    const slides = chunkArray(highlights, 2);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return; // Only slide if there is more than 1 slide (i.e. > 2 highlights)

        const timer = setInterval(() => {
            nextSlide();
        }, 10000);

        return () => clearInterval(timer);
    }, [nextSlide, slides.length]);

    return (
        <section className="highlights-section">
            <div className="section-title-wrapper">
                <h2 className="section-title"><BlurredStagger text="highlights!" /></h2>
                <svg className="sparkle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 12 10.5 21.5 12C12 13.5 12 22 12 22C12 22 12 13.5 2.5 12C12 10.5 12 2 12 2Z" fill="var(--capsule-bg)" />
                </svg>
            </div>
            <p className="section-subtitle">some things i made because i could</p>

            <div className="carousel-container">
                <button className="carousel-nav prev" aria-label="Previous" onClick={prevSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div className="carousel-track-container" style={{ overflow: "hidden", width: "100%", maxWidth: "600px" }}>
                    {slides.length > 0 ? (
                        <div className="carousel-track" style={{ transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 16}px))`, transition: "transform 0.4s ease-out", display: 'flex', gap: '16px' }}>
                            {slides.map((slide, slideIndex) => (
                                <div key={slideIndex} className="carousel-slide" style={{ flexShrink: 0, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    {slide.map((project: Highlight) => (
                                        <a key={project._id} href={project.link || "#"} target="_blank" rel="noopener noreferrer" className="project-card" style={{ width: "100%", height: "160px", display: "block", textDecoration: "none", overflow: "hidden", position: "relative" }}>
                                            {project.mediaType === 'image' && project.image && (
                                                <img src={urlFor(project.image).url()} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                            )}
                                            {project.mediaType === 'video' && project.videoFile?.asset?.url && (
                                                <video src={project.videoFile.asset.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                            )}
                                            {project.mediaType === 'video' && project.videoUrl && !project.videoFile && (
                                                // Simplified iframe setup for youtube/vimeo links. Ideally use a library like react-player for better cross-platform support.
                                                <iframe src={project.videoUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit', pointerEvents: 'none' }} />
                                            )}

                                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "12px" }}>
                                                <div style={{ background: "black", padding: "4px 12px", borderRadius: "100px" }}>
                                                    <h3 className="instrument-serif" style={{ margin: 0, fontSize: "1.2rem", fontWeight: "normal", color: "var(--text-primary)" }}>{project.title}</h3>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                            <p>No highlights found.</p>
                        </div>
                    )}
                </div>

                <button className="carousel-nav next" aria-label="Next" onClick={nextSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </section>
    );
}
