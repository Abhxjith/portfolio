import { defineField, defineType } from 'sanity';

export const aboutPageType = defineType({
    name: 'aboutPage',
    title: 'About Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Used internally for sanity list title (e.g. "Main About Page" or "Draft About").',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'aboutDescription',
            title: 'About Page Content',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                        }
                    ]
                }
            ],
            description: 'This is the content for the dedicated /about page. Keep it rich and add images!',
        }),
    ],
});
