import React from 'react';
import Link from 'next/link';
import { BlurredStagger } from './ui/blurred-stagger-text';

interface Project {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string;
}

interface ProjectPageTemplateProps {
    title: string;
    subtitle: string;
    projects: Project[];
    children?: React.ReactNode;
}

export default function ProjectPageTemplate({ title, subtitle, projects, children }: ProjectPageTemplateProps) {
    return (
        <div className="project-page-container">
            {(projects.length > 0 || children) && (
                <div className="project-page-header">
                    <h1 className="project-page-title"><BlurredStagger text={title} /></h1>
                    <p className="project-page-subtitle">{subtitle}</p>
                </div>
            )}

            {children}

            {projects.length === 0 ? (
                <div style={{ marginTop: "120px", textAlign: "center", marginBottom: "80px" }}>
                    <h2 className="instrument-serif" style={{ fontSize: "8rem", color: "var(--text-primary)", letterSpacing: "-0.05em", margin: 0, lineHeight: 1 }}>
                        <BlurredStagger text="Coming soon." />
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "16px", letterSpacing: "0.05em" }}>stay tuned</p>
                </div>
            ) : (
                <div className="project-list">
                    {projects.map((project) => {
                        const cardContent = (
                            <div className="project-list-card" style={project.link ? { cursor: "pointer" } : {}}>
                                <div className="project-list-image-placeholder">
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    )}
                                </div>
                                <div className="project-list-info">
                                    <h3 className="project-list-title">{project.title}</h3>
                                    {project.description && <p className="project-list-description">{project.description}</p>}
                                </div>
                            </div>
                        );

                        const isInternalLink = project.link?.startsWith('/');

                        return project.link ? (
                            isInternalLink ? (
                                <Link key={project.id} href={project.link} style={{ textDecoration: "none", color: "inherit" }}>
                                    {cardContent}
                                </Link>
                            ) : (
                                <a key={project.id} href={project.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                                    {cardContent}
                                </a>
                            )
                        ) : (
                            <div key={project.id} >
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
