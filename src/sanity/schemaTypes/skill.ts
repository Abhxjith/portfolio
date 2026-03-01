import { defineField, defineType } from 'sanity';

export const skillType = defineType({
    name: 'skill',
    title: 'Skill Stack Category',
    type: 'document',
    fields: [
        defineField({
            name: 'category',
            title: 'Category Name',
            type: 'string',
            description: 'e.g., development, creatives, ai & devops',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'skills',
            title: 'Skills',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Add individual skills as bullet points',
            validation: (rule) => rule.required().min(1),
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Lower numbers appear first (e.g. 1 for development, 2 for creatives)',
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
