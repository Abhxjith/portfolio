import { defineField, defineType } from 'sanity';

export const filmType = defineType({
    name: 'film',
    title: 'Film',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Short Description',
            type: 'text',
        }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail Image',
            type: 'image',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'contentBlocks',
            title: 'Content Blocks',
            type: 'array',
            description: 'Add images, videos, and text blocks for the dedicated film page.',
            of: [
                { type: 'image', options: { hotspot: true } },
                {
                    type: 'object',
                    name: 'videoBlock',
                    title: 'Video',
                    fields: [
                        defineField({
                            name: 'url',
                            title: 'Video URL',
                            type: 'url',
                        }),
                        defineField({
                            name: 'file',
                            title: 'Video File',
                            type: 'file',
                            options: { accept: 'video/mp4' },
                        }),
                    ]
                },
                {
                    type: 'block', // Portable text
                },
            ],
        }),
    ],
});
