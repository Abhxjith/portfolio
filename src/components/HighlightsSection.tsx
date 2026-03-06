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

const CARD_DURATION_MS = 15000; // 15 seconds per card

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

    const count = highlights.length;

    const maxIndex = Math.max(0, count - 2); // 2 cards visible, slide 1 at a time

    useEffect(() => {
        setCurrentIndex((prev) => (prev > maxIndex ? 0 : prev));
    }, [count, maxIndex]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (count <= 2 ? 0 : prev >= maxIndex ? 0 : prev + 1));
    }, [count, maxIndex]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (count <= 2 ? 0 : prev <= 0 ? maxIndex : prev - 1));
    }, [count, maxIndex]);

    useEffect(() => {
        if (count <= 2) return;

        const timer = setInterval(() => {
            nextSlide();
        }, CARD_DURATION_MS);

        return () => clearInterval(timer);
    }, [nextSlide, count]);

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
                {count > 2 && (
                    <button className="carousel-nav prev" aria-label="Previous" onClick={prevSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}

                <div className="carousel-track-container carousel-container-query" style={{ overflow: "hidden", width: "100%", maxWidth: "600px" }}>
                    {count > 0 ? (
                        <div
                            className="carousel-track carousel-track-double"
                            style={{
                                width: `calc(${count} * ((100cqw - 16px) / 2) + ${(count - 1) * 16}px)`,
                                transform: `translateX(calc(-${currentIndex} * ((100cqw - 16px) / 2 + 16px)))`,
                                transition: "transform 0.4s ease-out",
                                display: "flex",
                                gap: "16px",
                            }}
                        >
                            {highlights.map((project) => (
                                <div key={project._id} className="carousel-slide carousel-slide-double" style={{ flex: `0 0 calc((100cqw - 16px) / 2)` }}>
                                    <a href={project.link || "#"} target="_blank" rel="noopener noreferrer" className="project-card" style={{ display: "block", textDecoration: "none", overflow: "hidden", position: "relative" }}>
                                        {project.mediaType === 'image' && project.image && (
                                            <img src={urlFor(project.image).url()} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                        )}
                                        {project.mediaType === 'video' && project.videoFile?.asset?.url && (
                                            <video src={project.videoFile.asset.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                        )}
                                        {project.mediaType === 'video' && project.videoUrl && !project.videoFile && (
                                            <iframe src={project.videoUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit', pointerEvents: 'none' }} />
                                        )}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                            <p>No highlights found.</p>
                        </div>
                    )}
                </div>

                {count > 2 && (
                    <button className="carousel-nav next" aria-label="Next" onClick={nextSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                )}
            </div>
        </section>
    );
}
