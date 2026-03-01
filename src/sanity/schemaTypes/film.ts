import { defineField, defineType } from 'sanity';

export const filmType = defineType({
    name: 'film',
    title: 'Film Projects',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Short Description',
            type: 'text',
        }),
        defineField({
            name: 'youtubeUrl',
            title: 'YouTube URL',
            type: 'url',
            description: 'Link to the YouTube video. The thumbnail will be automatically extracted from this link.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'ranking',
            title: 'Ranking',
            type: 'number',
            description: 'Optional ranking number (e.g., 1, 2, 3...)',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'youtubeUrl',
        },
    },
});
