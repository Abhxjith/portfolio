import { defineField, defineType } from 'sanity';

export const blogType = defineType({
    name: 'blog',
    title: 'Blog',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'mediumLink',
            title: 'Medium Link',
            type: 'url',
            description: 'The Medium article URL to redirect to when clicked',
            validation: (rule) => rule.required(),
        }),
    ],
});
