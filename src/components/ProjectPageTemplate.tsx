import React from 'react';
import { BlurredStagger } from './ui/blurred-stagger-text';

interface Project {
    id: string;
    title: string;
    description: string;
    // Intended for future use when actual images/links are added
    imageUrl?: string;
    link?: string;
}

interface ProjectPageTemplateProps {
    title: string;
    subtitle: string;
    projects: Project[];
}

export default function ProjectPageTemplate({ title, subtitle, projects }: ProjectPageTemplateProps) {
    return (
        <div className="project-page-container">
            <div className="project-page-header">
                <h1 className="project-page-title"><BlurredStagger text={title} /></h1>
                <p className="project-page-subtitle">{subtitle}</p>
            </div>

            <div className="project-list">
                {projects.map((project) => (
                    <div key={project.id} className="project-list-card">
                        <div className="project-list-image-placeholder">
                            {/* Optional: Add Image tag here when imageUrl is available */}
                        </div>
                        <div className="project-list-info">
                            <h3 className="project-list-title">{project.title}</h3>
                            <p className="project-list-description">{project.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
