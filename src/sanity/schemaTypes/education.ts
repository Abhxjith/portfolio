import { defineField, defineType } from 'sanity';

export const educationType = defineType({
    name: 'education',
    title: 'Education',
    type: 'document',
    fields: [
        defineField({
            name: 'institution',
            title: 'Institution',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'degree',
            title: 'Degree',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Date Range',
            type: 'string',
            description: 'e.g., 2020 - 2024',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'cgpa',
            title: 'CGPA',
            type: 'string',
            description: 'e.g., 9.5 / 10',
        }),
        defineField({
            name: 'logo',
            title: 'Institution Logo',
            type: 'image',
            description: 'Logo to display in the circle avatar',
            options: { hotspot: true },
        }),
        defineField({
            name: 'link',
            title: 'Logo Link',
            type: 'url',
            description: 'Optional URL to open when the logo is clicked',
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Lower numbers appear first',
        }),
    ],
    orderings: [
        {
            title: 'Order, Asc',
            name: 'orderAsc',
            by: [
                { field: 'order', direction: 'asc' }
            ]
        }
    ]
});
