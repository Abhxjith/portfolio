import { defineField, defineType } from 'sanity';

export const devProjectType = defineType({
    name: 'devProject',
    title: 'Dev Project',
    type: 'document',
    fields: [
        defineField({
            name: 'rank',
            title: 'Rank',
            type: 'number',
            description: 'Lower numbers appear first. Use 1, 2, 3... to control display order.',
            validation: (rule) => rule.min(0).integer(),
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'link',
            title: 'Project Link',
            type: 'url',
        }),
    ],
});
