import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import { client } from "../../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

export const dynamic = 'force-dynamic';

export default async function WritingPage() {
    const blogs = await client.fetch(`*[_type == "blog"]{
        _id, title, image, mediumLink
    }`);

    const writingProjects = blogs.map((blog: any) => ({
        id: blog._id,
        title: blog.title,
        description: "Read on Medium",
        imageUrl: blog.image ? urlFor(blog.image).width(600).url() : undefined,
        link: blog.mediumLink,
    }));

    return (
        <ProjectPageTemplate
            title="writing projects"
            subtitle="some things i have worked real hard on."
            projects={writingProjects}
        />
    );
}
