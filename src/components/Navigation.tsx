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
    const [resumeUrl, setResumeUrl] = useState("/resume"); // Fallback if not found

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
        // Generate 30-40 random stars
        const newStars: Star[] = Array.from({ length: 35 }).map(() => ({
            id: Math.random(),
            left: Math.random() * 100, // random left percentage 0-100%
            size: Math.random() * 1.5 + 0.5, // 0.5rem to 2.0rem size
            duration: Math.random() * 2 + 1.5, // 1.5s to 3.5s fall duration
            delay: Math.random() * 0.5, // 0s to 0.5s stagger delay
            color: Math.random() > 0.5 ? "var(--text-primary)" : "var(--capsule-bg)",
        }));

        setStars((prev) => [...prev, ...newStars]);

        // Cleanup stars after they finish falling (max duration + max delay + buffer = ~4.5s)
        setTimeout(() => {
            setStars((prev) => prev.filter(star => !newStars.find(s => s.id === star.id)));
        }, 4500);
    }, []);

    return (
        <>
            {/* Raining Stars Container */}
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
