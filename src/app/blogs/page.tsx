import ProjectPageTemplate from "@/components/ProjectPageTemplate";

const writingProjects = [
    { id: "write1", title: "Project", description: "This is a Project" },
    { id: "write2", title: "Project", description: "This is a Project" },
];

export default function WritingPage() {
    return (
        <ProjectPageTemplate
            title="writing projects"
            subtitle="some things i have worked real hard on."
            projects={writingProjects}
        />
    );
}
