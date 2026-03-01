import ProjectPageTemplate from "@/components/ProjectPageTemplate";

const uiuxProjects = [
    { id: "uiux1", title: "Project", description: "This is a Project" },
    { id: "uiux2", title: "Project", description: "This is a Project" },
];

export default function UIUXPage() {
    return (
        <ProjectPageTemplate
            title="ui/ux projects"
            subtitle="some things i have worked real hard on."
            projects={uiuxProjects}
        />
    );
}
