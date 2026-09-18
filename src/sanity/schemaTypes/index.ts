import { type SchemaTypeDefinition } from 'sanity'
import { artType } from './art'
import { artGalleryType } from './artGallery'
import { pdfBookType } from './pdfBook'
import { devProjectType } from './devProject'
import { uiuxProjectType } from './uiuxProject'
import { filmType } from './film'
import { blogType } from './blog'
import { siteSettingsType } from './siteSettings'
import { highlightType } from './highlight'
import { experienceType } from './experience'
import { educationType } from './education'
import { skillType } from './skill'
import { aboutPageType } from './aboutPage'
import { filmRecommendationType } from './filmRecommendation'
import { musicType } from './music'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    artType,
    artGalleryType,
    pdfBookType,
    devProjectType,
    uiuxProjectType,
    filmType,
    blogType,
    musicType,
    siteSettingsType,
    highlightType,
    experienceType,
    educationType,
    skillType,
    aboutPageType,
    filmRecommendationType,
  ],
}
