import { defineField, defineType } from 'sanity';

export const artType = defineType({
    name: 'art',
    title: 'Art',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'mediaType',
            title: 'Media Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Image', value: 'image' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio',
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
            hidden: ({ document }) => document?.mediaType !== 'image',
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL (e.g. YouTube/Vimeo)',
            type: 'url',
            description: 'Provide an external video URL',
            hidden: ({ document }) => document?.mediaType !== 'video',
        }),
        defineField({
            name: 'videoFile',
            title: 'Video File',
            type: 'file',
            description: 'Upload an mp4 file if not using a URL',
            options: {
                accept: 'video/mp4',
            },
            hidden: ({ document }) => document?.mediaType !== 'video',
        }),
    ],
});
