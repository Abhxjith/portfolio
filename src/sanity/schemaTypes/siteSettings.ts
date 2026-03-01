import { defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'jobTitle',
            title: 'Job Title (Hero Subtitle)',
            type: 'string',
            description: 'e.g. dev @ schapira',
        }),
        defineField({
            name: 'heroDescription',
            title: 'Hero Description (About)',
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
            description: 'This is the main "about" paragraph on the home page. You can add text and images here.',
        }),
        defineField({
            name: 'resumePdf',
            title: 'Resume PDF',
            type: 'file',
            description: 'Upload your resume PDF here. The navigation menu will automatically link to this file.',
            options: {
                accept: 'application/pdf',
            },
        }),
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'string',
        }),
        defineField({
            name: 'linkedin',
            title: 'LinkedIn URL',
            type: 'url',
        }),
        defineField({
            name: 'twitter',
            title: 'X (Twitter) URL',
            type: 'url',
        }),
        defineField({
            name: 'github',
            title: 'GitHub URL',
            type: 'url',
        }),
    ],
});
