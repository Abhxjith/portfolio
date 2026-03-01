'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
    _id: string;
    title: string;
    director?: string;
    year?: string;
    link?: string;
}

interface FilmRecommendationModalProps {
    recommendations: Recommendation[];
    title: string;
}

export default function FilmRecommendationModal({ recommendations, title }: FilmRecommendationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Curved text generation
    const text = "click me • film recom • ";
    const characters = text.split("");
    const radius = 40;

    // Prevent scrolling when modal is open
    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <div
                className="film-recom-trigger"
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'absolute',
                    right: '10%',
                    top: '20px',
                    cursor: 'pointer',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                }}
            >
                {/* Rotating Text */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                >
                    {characters.map((char, i) => {
                        const angle = (i / characters.length) * 360;
                        return (
                            <span
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-geist-sans)'
                                }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </motion.div>

                {/* Red Circle */}
                <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    backgroundColor: isHovered ? '#ff5a50' : '#FF3B30',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    zIndex: 2
                }} />
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                key="modal-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    backdropFilter: 'blur(5px)',
                                    zIndex: 100
                                }}
                            />
                            <motion.div
                                key="modal-content"
                                initial={{ opacity: 0, x: '-50%', y: '-40%', scale: 0.95 }}
                                animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
                                exit={{ opacity: 0, x: '-50%', y: '-40%', scale: 0.95 }}
                                style={{
                                    position: 'fixed',
                                    top: '50%',
                                    left: '50%',
                                    width: '90%',
                                    maxWidth: '500px',
                                    maxHeight: '80vh',
                                    backgroundColor: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    zIndex: 101,
                                    overflowY: 'auto'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 className="instrument-serif" style={{ fontSize: "2rem", color: "var(--text-primary)", letterSpacing: "-0.05em", margin: 0 }}>
                                        {title}
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {recommendations.length > 0 ? (
                                    <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "16px", margin: 0 }}>
                                        {recommendations.map((rec) => (
                                            <li key={rec._id} style={{ fontSize: "1rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", paddingBottom: "12px" }}>
                                                {rec.link ? (
                                                    <a href={rec.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 500 }}>
                                                        {rec.title} {rec.year && `(${rec.year})`}
                                                    </a>
                                                ) : (
                                                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                                                        {rec.title} {rec.year && `(${rec.year})`}
                                                    </span>
                                                )}
                                                {rec.director && <span style={{ fontStyle: "italic", fontSize: "0.9rem" }}>Dir. {rec.director}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '40px 0' }}>No recommendations added yet.</p>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
