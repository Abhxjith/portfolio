import ProjectPageTemplate from "@/components/ProjectPageTemplate";

const artProjects = [
    { id: "art1", title: "Project", description: "This is a Project" },
    { id: "art2", title: "Project", description: "This is a Project" },
    { id: "art3", title: "Project", description: "This is a Project" },
];

export default function ArtPage() {
    return (
        <ProjectPageTemplate
            title="art projects"
            subtitle="some things i have worked real hard on."
            projects={artProjects}
        />
    );
}
