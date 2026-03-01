import { defineField, defineType } from 'sanity';

export const filmRecommendationType = defineType({
    name: 'filmRecommendation',
    title: 'Film Recommendation',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Movie Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'director',
            title: 'Director',
            type: 'string',
        }),
        defineField({
            name: 'year',
            title: 'Release Year',
            type: 'string',
        }),
        defineField({
            name: 'link',
            title: 'Letterboxd/IMDB Link',
            type: 'url',
            description: 'Optional link to the movie details',
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which this movie appears in the list (1 is top)',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'director',
        },
    },
});
