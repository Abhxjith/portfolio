"use client";

import { useState, useEffect } from "react";
import { client } from "../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
    return builder.image(source)
}

interface Education {
    _id: string;
    institution: string;
    degree: string;
    date: string;
    cgpa?: string;
    logo?: any;
    link?: string;
}

function EducationItem({ institution, degree, date, cgpa, logo, link }: any) {
    const isSmallerLogo = institution.toLowerCase().includes('persist') || institution.toLowerCase().includes('iit') || institution.toLowerCase().includes('pillai');
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
                            <img src={urlFor(logo).width(64).url()} alt={`${institution} logo`} style={imageStyle} />
                        </a>
                    ) : (
                        <img src={urlFor(logo).width(64).url()} alt={`${institution} logo`} style={imageStyle} />
                    )
                ) : null}
            </div>
            <div className="experience-content">
                <div className="experience-header">
                    <div className="experience-info">
                        <h3 className="company-name">{institution}</h3>
                        <p className="role-name">{degree}</p>
                        {cgpa && <p className="role-name" style={{ marginTop: "2px", color: "var(--text-secondary)" }}>CGPA: {cgpa}</p>}
                    </div>
                    <div className="experience-date">{date}</div>
                </div>
            </div>
        </div>
    );
}

export default function EducationSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [education, setEducation] = useState<Education[]>([]);

    useEffect(() => {
        const fetchEducation = async () => {
            const data = await client.fetch(`*[_type == "education"] | order(order asc){
                _id, institution, degree, date, cgpa, logo, link
            }`);
            setEducation(data);
        };
        fetchEducation();
    }, []);

    if (education.length === 0) return null;

    return (
        <section className="experience-section">
            <h2 className="section-title">my education</h2>

            <div className="experience-list">
                {education.map((edu, index) => (
                    <EducationItem
                        key={edu._id}
                        {...edu}
                    />
                ))}
            </div>
        </section>
    );
}
