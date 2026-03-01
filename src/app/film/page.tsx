import ProjectPageTemplate from "@/components/ProjectPageTemplate";

const filmProjects = [
    { id: "film1", title: "Project", description: "This is a Project" },
    { id: "film2", title: "Project", description: "This is a Project" },
];

export default function FilmPage() {
    return (
        <ProjectPageTemplate
            title="film projects"
            subtitle="some things i have worked real hard on."
            projects={filmProjects}
        />
    );
}
