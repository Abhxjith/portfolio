"use client";

import { useState, useEffect } from "react";
import { client } from "../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
    return builder.image(source)
}

interface Experience {
    _id: string;
    company: string;
    role: string;
    date: string;
    location?: string;
    description: string[];
    logo?: any;
    link?: string;
}

function ExperienceItem({ company, role, date, location, description, logo, link, isOpen, onClick }: any) {
    const isSmallerLogo = company.toLowerCase().includes('persist') || company.toLowerCase().includes('iit');
    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "contain" as "contain",
        filter: "grayscale(100%)",
        transform: isSmallerLogo ? "scale(0.7)" : "scale(1)",
        transition: "transform 0.3s ease"
    };

    return (
        <div className="experience-item">
            <div className={"experience-avatar"} style={{ overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", padding: isSmallerLogo ? "4px" : "0" }}>
                {logo ? (
                    link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ width: "100%", height: "100%", display: "block" }}>
                            <img src={urlFor(logo).width(64).url()} alt={`${company} logo`} style={imageStyle} />
                        </a>
                    ) : (
                        <img src={urlFor(logo).width(64).url()} alt={`${company} logo`} style={imageStyle} />
                    )
                ) : null}
            </div>
            <div className="experience-content">
                <div className="experience-header">
                    <div className="experience-info">
                        <h3 className="company-name">{company}</h3>
                        <p className="role-name">{role}</p>
                    </div>
                    <div className="experience-date">
                        <div>{date}</div>
                        {location && <div style={{ color: "var(--text-secondary)", fontSize: "0.9em", marginTop: "2px", textAlign: "right" }}>{location}</div>}
                    </div>
                </div>
                <div className={`experience-details ${isOpen ? "open" : ""}`}>
                    <div className="experience-summary" onClick={onClick}>
                        <span className="summary-icon">►</span> my work
                    </div>
                    <div className="experience-dropdown">
                        <div className="experience-dropdown-inner">
                            <ul style={{ paddingLeft: "20px", margin: 0 }}>
                                {Array.isArray(description) ? description.map((bullet: string, i: number) => (
                                    <li key={i} style={{ marginBottom: "6px" }}>{bullet}</li>
                                )) : <p>{description}</p>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExperienceSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        const fetchExperiences = async () => {
            const data = await client.fetch(`*[_type == "experience"] | order(order asc){
                _id, company, role, date, location, description, logo, link
            }`);
            setExperiences(data);
        };
        fetchExperiences();
    }, []);

    if (experiences.length === 0) return null;

    return (
        <section className="experience-section">
            <h2 className="section-title">my experience</h2>

            <div className="experience-list">
                {experiences.map((exp, index) => (
                    <ExperienceItem
                        key={exp._id}
                        {...exp}
                        isOpen={openIndex === index}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                ))}
            </div>
        </section>
    );
}
