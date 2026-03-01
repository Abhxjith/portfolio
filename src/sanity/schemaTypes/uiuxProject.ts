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
            name: 'fullImage',
            title: 'Full Image',
            type: 'image',
            description: 'High resolution image shown when clicked (Full Screen)',
        }),
        defineField({
            name: 'link',
            title: 'Prototype Link (Optional)',
            type: 'url',
        }),
    ],
});
