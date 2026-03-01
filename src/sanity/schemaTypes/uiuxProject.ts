import { defineField, defineType } from 'sanity';

export const uiuxProjectType = defineType({
    name: 'uiuxProject',
    title: 'UI/UX Project',
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
            title: 'Description',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail Image',
            type: 'image',
            description: 'Image shown in the list grid',
            options: { hotspot: true },
        }),
        defineField({
            name: 'image1',
            title: 'Project Image 1',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'textBlock1',
            title: 'Text Block 1 (Optional)',
            type: 'text',
            description: 'Optional text to display between Image 1 and Image 2',
        }),
        defineField({
            name: 'image2',
            title: 'Project Image 2',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'textBlock2',
            title: 'Text Block 2 (Optional)',
            type: 'text',
            description: 'Optional text to display between Image 2 and Image 3',
        }),
        defineField({
            name: 'image3',
            title: 'Project Image 3',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'video1',
            title: 'Project Video 1 (YouTube URL)',
            type: 'url',
        }),
        defineField({
            name: 'video2',
            title: 'Project Video 2 (YouTube URL)',
            type: 'url',
        }),
        defineField({
            name: 'liveLink',
            title: 'Live Site / Prototype Link',
            type: 'url',
        }),
    ],
});
