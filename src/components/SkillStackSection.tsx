"use client";

import { useState, useEffect } from "react";
import { client } from "../sanity/lib/client";

interface SkillCategory {
    _id: string;
    category: string;
    skills: string[];
}

export default function SkillStackSection() {
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

    useEffect(() => {
        const fetchSkills = async () => {
            const data = await client.fetch(`*[_type == "skill"] | order(order asc){
                _id, category, skills
            }`);
            setSkillCategories(data);
        };
        fetchSkills();
    }, []);

    if (skillCategories.length === 0) return null;

    return (
        <section className="skill-stack-section">
            <h2 className="section-title">skill stack</h2>

            <div className="skills-container">
                {skillCategories.map((sc) => (
                    <div key={sc._id} className="skill-category">
                        <h3 className="category-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--capsule-bg)" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                            </svg>
                            {sc.category}
                        </h3>
                        <div className="skill-pills">
                            {sc.skills?.map((skill, index) => (
                                <div key={index} className="skill-pill">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
