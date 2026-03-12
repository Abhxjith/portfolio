import { defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    groups: [
        { name: 'content', title: 'Content', default: true },
        { name: 'metadata', title: 'SEO & Metadata' },
    ],
    fields: [
        defineField({
            name: 'jobTitle',
            title: 'Job Title (Hero Subtitle)',
            type: 'string',
            description: 'e.g. dev @ schapira',
            group: 'content',
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
            group: 'content',
        }),
        defineField({
            name: 'resumePdf',
            title: 'Resume PDF',
            type: 'file',
            description: 'Upload your resume PDF here. The navigation menu will automatically link to this file.',
            options: {
                accept: 'application/pdf',
            },
            group: 'content',
        }),
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'string',
            group: 'content',
        }),
        defineField({
            name: 'linkedin',
            title: 'LinkedIn URL',
            type: 'url',
            group: 'content',
        }),
        defineField({
            name: 'twitter',
            title: 'X (Twitter) URL',
            type: 'url',
            group: 'content',
        }),
        defineField({
            name: 'github',
            title: 'GitHub URL',
            type: 'url',
            group: 'content',
        }),
        // SEO & Metadata
        defineField({
            name: 'siteTitle',
            title: 'Site Title',
            type: 'string',
            description: 'Default <title> and used in Open Graph / Twitter cards. e.g. "Product & Design-First Software Engineer | Abhijith"',
            group: 'metadata',
        }),
        defineField({
            name: 'siteDescription',
            title: 'Site Description',
            type: 'text',
            description: 'Default meta description and used in Open Graph / Twitter cards.',
            group: 'metadata',
        }),
        defineField({
            name: 'siteUrl',
            title: 'Site URL',
            type: 'url',
            description: 'Canonical site URL, e.g. https://abhijithjinnu.in',
            group: 'metadata',
        }),
        defineField({
            name: 'defaultOgImage',
            title: 'Default OG / Social Image',
            type: 'image',
            description: 'Image shown when sharing links (Open Graph, Twitter). Recommended 1200×630px.',
            options: { hotspot: true },
            group: 'metadata',
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Image alt text',
                    description: 'Describe the image for accessibility and SEO',
                },
            ],
        }),
        defineField({
            name: 'keywords',
            title: 'Keywords',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Meta keywords (optional, comma or separate entries)',
            group: 'metadata',
        }),
        defineField({
            name: 'openGraphTitle',
            title: 'Open Graph Title (optional)',
            type: 'string',
            description: 'Override for social share title. Leave blank to use Site Title.',
            group: 'metadata',
        }),
        defineField({
            name: 'openGraphDescription',
            title: 'Open Graph Description (optional)',
            type: 'text',
            description: 'Override for social share description. Leave blank to use Site Description.',
            group: 'metadata',
        }),
        defineField({
            name: 'twitterHandle',
            title: 'Twitter / X Handle',
            type: 'string',
            description: 'e.g. @username (without @)',
            group: 'metadata',
        }),
    ],
});
