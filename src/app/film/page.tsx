import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import FilmRecommendationModal from "@/components/FilmRecommendationModal";
import { client } from "../../sanity/lib/client";
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export const dynamic = 'force-dynamic';

export default async function FilmPage() {
    // Fetch both the film projects and the movie recommendations in parallel
    const [films, recommendations] = await Promise.all([
        client.fetch(`*[_type == "film"] | order(ranking asc){
            _id, title, description, youtubeUrl, ranking
        }`),
        client.fetch(`*[_type == "filmRecommendation"] | order(order asc){
            _id, title, director, year, link
        }`)
    ]);

    const filmProjects = films.map((film: any) => {
        const videoId = getYouTubeId(film.youtubeUrl);
        return {
            id: film._id,
            title: film.title,
            description: film.description,
            imageUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined,
            link: film.youtubeUrl,
            ranking: film.ranking,
        };
    });

    return (
        <ProjectPageTemplate
            title="films"
            subtitle="some things i have worked real hard on."
            projects={filmProjects}
        >
            {recommendations.length > 0 && (
                <FilmRecommendationModal
                    recommendations={recommendations}
                    title="movie recommendations by abhijith"
                />
            )}
        </ProjectPageTemplate>
    );
}
