import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import { client } from "../../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

export const dynamic = 'force-dynamic';

export default async function ArtPage() {
    const data = await client.fetch(`*[_type == "art"]{
        _id, title, description, image, link
    }`);

    const artProjects = data.map((project: any) => ({
        id: project._id,
        title: project.title,
        description: project.description,
        imageUrl: project.image ? urlFor(project.image).width(600).url() : undefined,
        link: project.link,
    }));

    return (
        <ProjectPageTemplate
            title="art projects"
            subtitle="some things i have worked real hard on."
            projects={artProjects}
        />
    );
}
