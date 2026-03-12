import { client } from './client'
import { urlFor } from './image'

const DEFAULT_METADATA = {
  siteTitle: 'Product & Design-First Software Engineer | Abhijith',
  siteDescription:
    'Product-focused software engineer who builds apps, systems, and experiences with strong UX and creative intent. Uses AI to accelerate execution, not replace originality. Drawn to early-stage startups and people who care about craft.',
  siteUrl: 'https://abhijithjinnu.in',
  openGraphTitle: 'Product & Design-First Software Engineer | Abhijith',
  openGraphDescription:
    'I build software, music, films, and products with taste. UX-first, systems-minded, and obsessed with making things that feel right. Looking to work with founders and creative builders.',
  defaultOgImageUrl: '/twittercard.png',
  defaultOgImageAlt: 'Abhijith - Product & Design-First Software Engineer',
  keywords: [
    'product engineer',
    'design first software engineer',
    'creative technologist',
    'UX focused developer',
    'startup engineer',
    'full stack builder',
    'systems thinker',
  ],
}

export type SiteMetadata = {
  siteTitle: string
  siteDescription: string
  siteUrl: string
  openGraphTitle: string
  openGraphDescription: string
  defaultOgImageUrl: string
  defaultOgImageAlt: string
  keywords: string[]
  twitterHandle?: string
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
  try {
    const data = await client.fetch<{
      siteTitle?: string
      siteDescription?: string
      siteUrl?: string
      openGraphTitle?: string
      openGraphDescription?: string
      defaultOgImage?: { asset?: { _ref?: string }; alt?: string }
      keywords?: string[]
      twitterHandle?: string
    } | null>(
      `*[_type == "siteSettings"][0]{
        siteTitle,
        siteDescription,
        siteUrl,
        openGraphTitle,
        openGraphDescription,
        defaultOgImage,
        keywords,
        twitterHandle
      }`
    )

    if (!data) {
      return DEFAULT_METADATA as SiteMetadata
    }

    const ogImageUrl = data.defaultOgImage
      ? urlFor(data.defaultOgImage).width(1200).height(630).url()
      : DEFAULT_METADATA.defaultOgImageUrl

    const ogImageAlt =
      (data.defaultOgImage as { alt?: string } | undefined)?.alt ??
      DEFAULT_METADATA.defaultOgImageAlt

    return {
      siteTitle: data.siteTitle ?? DEFAULT_METADATA.siteTitle,
      siteDescription: data.siteDescription ?? DEFAULT_METADATA.siteDescription,
      siteUrl: data.siteUrl ?? DEFAULT_METADATA.siteUrl,
      openGraphTitle: data.openGraphTitle ?? data.siteTitle ?? DEFAULT_METADATA.openGraphTitle,
      openGraphDescription:
        data.openGraphDescription ?? data.siteDescription ?? DEFAULT_METADATA.openGraphDescription,
      defaultOgImageUrl: ogImageUrl,
      defaultOgImageAlt: ogImageAlt,
      keywords: Array.isArray(data.keywords) ? data.keywords : DEFAULT_METADATA.keywords,
      twitterHandle: data.twitterHandle,
    }
  } catch {
    return DEFAULT_METADATA as SiteMetadata
  }
}
