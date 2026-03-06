import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import { client } from "../../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

export const dynamic = 'force-dynamic';

export default async function UIUXPage() {
    const data = await client.fetch(`*[_type == "uiuxProject"] | order(coalesce(rank, 999999) asc, _createdAt asc){
        _id, title, description, thumbnail, "slug": slug.current
    }`);

    const uiuxProjects = data.map((project: any) => ({
        id: project._id,
        title: project.title,
        description: project.description,
        imageUrl: project.thumbnail ? urlFor(project.thumbnail).width(600).url() : undefined,
        link: project.slug ? `/uiux/${project.slug}` : undefined,
    }));

    return (
        <ProjectPageTemplate
            title="ui/ux projects"
            subtitle="some things i have worked real hard on."
            projects={uiuxProjects}
        />
    );
}
