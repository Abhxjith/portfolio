import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
const GROUPED_UNDER_ART = new Set(['art', 'artGallery', 'music', 'pdfBook'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.listItem()
        .title('Art')
        .child(
          S.list()
            .title('Art')
            .items([
              S.documentTypeListItem('art').title('Art Projects (image / video)'),
              S.documentTypeListItem('artGallery').title('Art Galleries (3D Rooms)'),
              S.documentTypeListItem('pdfBook').title('PDF Books'),
              S.documentTypeListItem('music').title('Music Albums'),
            ])
        ),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'siteSettings' && !GROUPED_UNDER_ART.has(item.getId() || '')
      ),
    ])
