import { defineArrayMember, defineField, defineType } from 'sanity';

export const musicType = defineType({
    name: 'music',
    title: 'Music',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Album Title',
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
            rows: 3,
        }),
        defineField({
            name: 'genre',
            title: 'Genre',
            type: 'string',
            description: 'e.g. Pop, Electronic, Indie',
        }),
        defineField({
            name: 'year',
            title: 'Year',
            type: 'number',
            validation: (rule) => rule.min(1900).max(2100).integer(),
        }),
        defineField({
            name: 'artwork',
            title: 'Album Artwork',
            type: 'image',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'playbackSource',
            title: 'Playback Source',
            type: 'string',
            options: {
                list: [
                    { title: 'Uploaded tracks (m4a)', value: 'hosted' },
                    { title: 'Apple Music embed', value: 'appleMusic' },
                ],
                layout: 'radio',
            },
            initialValue: 'hosted',
        }),
        defineField({
            name: 'appleMusicEmbedUrl',
            title: 'Apple Music Embed URL',
            type: 'url',
            description:
                'Paste the embed URL from Apple Music (Share → Embed). e.g. https://embed.music.apple.com/in/album/...',
            hidden: ({ document }) => document?.playbackSource !== 'appleMusic',
            validation: (rule) =>
                rule.custom((value, context) => {
                    const source = (context.document as { playbackSource?: string })
                        ?.playbackSource;
                    if (source !== 'appleMusic') return true;
                    if (!value) return 'Required when using Apple Music embed';
                    if (!String(value).includes('embed.music.apple.com')) {
                        return 'Must be an Apple Music embed URL (embed.music.apple.com)';
                    }
                    return true;
                }),
        }),
        defineField({
            name: 'tracks',
            title: 'Tracks',
            type: 'array',
            hidden: ({ document }) => document?.playbackSource === 'appleMusic',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'track',
                    fields: [
                        defineField({
                            name: 'title',
                            title: 'Track Title',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'audioFile',
                            title: 'Audio File (optional)',
                            type: 'file',
                            description: 'Optional m4a upload. Leave blank to list the track name only.',
                            options: {
                                accept: 'audio/mp4,audio/x-m4a,audio/m4a,.m4a',
                            },
                        }),
                    ],
                    preview: {
                        select: { title: 'title' },
                        prepare({ title }) {
                            return { title: title || 'Untitled track' };
                        },
                    },
                }),
            ],
            validation: (rule) =>
                rule.custom((value, context) => {
                    const source = (context.document as { playbackSource?: string })
                        ?.playbackSource;
                    if (source === 'appleMusic') return true;
                    if (!value || value.length < 1) {
                        return 'At least one track is required for uploaded playback';
                    }
                    return true;
                }),
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
            title: 'Display Order',
            name: 'orderAsc',
            by: [
                { field: 'order', direction: 'asc' },
                { field: '_createdAt', direction: 'desc' },
            ],
        },
    ],
    preview: {
        select: { title: 'title', media: 'artwork' },
    },
});
