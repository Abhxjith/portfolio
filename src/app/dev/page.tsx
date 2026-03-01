import ProjectPageTemplate from "@/components/ProjectPageTemplate";

const devProjects = [
    { id: "dev1", title: "Project", description: "This is a Project" },
    { id: "dev2", title: "Project", description: "This is a Project" },
    { id: "dev3", title: "Project", description: "This is a Project" },
];

export default function DevPage() {
    return (
        <ProjectPageTemplate
            title="dev projects"
            subtitle="some things i have worked real hard on."
            projects={devProjects}
        />
    );
}
