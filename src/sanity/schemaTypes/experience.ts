import { defineField, defineType } from 'sanity';

export const experienceType = defineType({
    name: 'experience',
    title: 'Experience',
    type: 'document',
    fields: [
        defineField({
            name: 'company',
            title: 'Company',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Date Range',
            type: 'string',
            description: 'e.g., june 2024 - present',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
            description: 'e.g., Remote, San Francisco, CA',
        }),
        defineField({
            name: 'description',
            title: 'Description (Bullet Points)',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Add each bullet point separately.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'logo',
            title: 'Company Logo',
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
