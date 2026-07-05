"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { client } from "../sanity/lib/client";

interface Star {
    id: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
}

export default function Navigation() {
    const pathname = usePathname();
    const [stars, setStars] = useState<Star[]>([]);
    const [resumeUrl, setResumeUrl] = useState("/resume");
    const hideOnMusicAlbum = pathname.startsWith("/art/music/");

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const data = await client.fetch(`*[_type == "siteSettings"][0]{
                    "pdfUrl": resumePdf.asset->url
                }`);
                if (data?.pdfUrl) {
                    setResumeUrl(data.pdfUrl);
                }
            } catch (error) {
                console.error("Error fetching resume URL from Sanity:", error);
            }
        };
        fetchResume();
    }, []);

    const triggerStars = useCallback(() => {
        const newStars: Star[] = Array.from({ length: 35 }).map(() => ({
            id: Math.random(),
            left: Math.random() * 100,
            size: Math.random() * 1.5 + 0.5,
            duration: Math.random() * 2 + 1.5,
            delay: Math.random() * 0.5,
            color: Math.random() > 0.5 ? "var(--text-primary)" : "var(--capsule-bg)",
        }));

        setStars((prev) => [...prev, ...newStars]);

        setTimeout(() => {
            setStars((prev) => prev.filter(star => !newStars.find(s => s.id === star.id)));
        }, 4500);
    }, []);

    if (hideOnMusicAlbum) {
        return null;
    }

    return (
        <>
            <div className="raining-stars-container">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="falling-star"
                        style={{
                            left: `${star.left}%`,
                            fontSize: `${star.size}rem`,
                            animationDuration: `${star.duration}s`,
                            animationDelay: `${star.delay}s`,
                            color: star.color,
                        }}
                    >
                        ✦
                    </div>
                ))}
            </div>

            <header className="top-nav">
                <nav>
                    <a href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>home</a>
                    <a href="/about" className={`nav-link ${pathname === "/about" ? "active" : ""}`}>about</a>
                    <div className="nav-logo" onClick={triggerStars} style={{ cursor: "pointer" }}>
                        <Image src="/logo.avif" alt="Logo" width={28} height={28} style={{ objectFit: 'contain' }} />
                    </div>
                    <a href={resumeUrl} target={resumeUrl !== "/resume" ? "_blank" : undefined} rel={resumeUrl !== "/resume" ? "noopener noreferrer" : undefined} className={`nav-link ${pathname === "/resume" ? "active" : ""}`}>resume</a>
                    <a href="/contact" className={`nav-link ${pathname === "/contact" ? "active" : ""}`}>contact</a>
                </nav>
            </header>
        </>
    );
}
