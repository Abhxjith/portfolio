import { defineField, defineType } from 'sanity';
import { BOOK_TYPES } from '@/lib/bookTypes';

export const pdfBookType = defineType({
  name: 'pdfBook',
  title: 'PDF Book',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      name: 'bookType',
      title: 'Book Type',
      type: 'string',
      options: {
        list: [...BOOK_TYPES],
        layout: 'radio',
      },
      initialValue: 'zine',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pdf',
      title: 'PDF File',
      type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Upload the book PDF. The first page is used as the cover on the art page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cover',
      title: 'Cover Override (optional)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Optional. Leave empty to auto-use the first page of the PDF as the cover.',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (rule) => rule.min(1900).max(2100).integer(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first on the art page',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      bookType: 'bookType',
      media: 'cover',
    },
    prepare({ title, bookType, media }) {
      const typeLabel =
        BOOK_TYPES.find((t) => t.value === bookType)?.title ?? bookType;
      return {
        title: title ?? 'Untitled book',
        subtitle: typeLabel,
        media,
      };
    },
  },
});
