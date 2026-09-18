import { defineArrayMember, defineField, defineType } from 'sanity';

export const artGalleryType = defineType({
    name: 'artGallery',
    title: 'Art Gallery (3D Room)',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Shown on the art page card and the gallery intro screen',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
            description: 'Intro paragraph shown on the "Start Now" screen',
        }),
        defineField({
            name: 'cover',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true },
            description: 'Card image on the art page',
        }),
        defineField({
            name: 'month',
            title: 'Month',
            type: 'string',
            description: 'e.g. "July" — shown under the card title',
        }),
        defineField({
            name: 'year',
            title: 'Year',
            type: 'number',
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Lower numbers appear first on the art page',
        }),
        defineField({
            name: 'artworks',
            title: 'Artworks (5–10)',
            type: 'array',
            description:
                'First artwork hangs on the far wall; the rest alternate left/right. The room grows to fit.',
            validation: (rule) => rule.min(5).max(10),
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'galleryArtwork',
                    title: 'Artwork',
                    fields: [
                        defineField({
                            name: 'title',
                            title: 'Title',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'year',
                            title: 'Year',
                            type: 'string',
                        }),
                        defineField({
                            name: 'medium',
                            title: 'Medium',
                            type: 'string',
                            description: 'e.g. "Oil on canvas"',
                        }),
                        defineField({
                            name: 'note',
                            title: 'Note / Description',
                            type: 'text',
                            rows: 3,
                            description: 'Shown in the inspect view when the painting is clicked',
                        }),
                        defineField({
                            name: 'aspect',
                            title: 'Aspect Ratio',
                            type: 'string',
                            description: 'Shape of the artwork itself — the frame (if any) wraps this',
                            options: {
                                list: [
                                    { title: 'Wide (16:10)', value: 'wide' },
                                    { title: 'Tall (3:4)', value: 'tall' },
                                    { title: 'Square (1:1)', value: 'square' },
                                ],
                                layout: 'radio',
                            },
                            initialValue: 'tall',
                        }),
                        defineField({
                            name: 'framed',
                            title: 'Framed',
                            type: 'boolean',
                            description:
                                'On: wood frame + mat. Off: stretched canvas with visible depth (no frame)',
                            initialValue: true,
                        }),
                        defineField({
                            name: 'image',
                            title: 'Image',
                            type: 'image',
                            options: { hotspot: true },
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            medium: 'medium',
                            framed: 'framed',
                            media: 'image',
                        },
                        prepare({ title, medium, framed, media }) {
                            const frameLabel = framed === false ? 'Canvas' : 'Framed';
                            return {
                                title,
                                subtitle: [medium, frameLabel].filter(Boolean).join(' · '),
                                media,
                            };
                        },
                    },
                }),
            ],
        }),
    ],
    preview: {
        select: { title: 'title', media: 'cover' },
    },
});
