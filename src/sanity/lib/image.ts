import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/** Listing sleeves (~280px CSS) — small WebP for fast LCP */
export function listingCoverUrl(source: SanityImageSource) {
  return urlFor(source).width(560).height(560).fit("crop").auto("format").quality(72).url()
}

/** Tiny thumb for vinyl label / non-LCP chrome */
export function listingThumbUrl(source: SanityImageSource) {
  return urlFor(source).width(128).height(128).fit("crop").auto("format").quality(60).url()
}

/** A4 book covers on the listing */
export function listingBookCoverUrl(source: SanityImageSource) {
  return urlFor(source).width(480).height(680).fit("crop").auto("format").quality(72).url()
}

/** Flipbook first paint — sharper than listing, still WebP */
export function flipbookCoverUrl(source: SanityImageSource) {
  return urlFor(source).width(720).height(1020).fit("crop").auto("format").quality(78).url()
}

/** Gallery wall paintings */
export function galleryArtworkUrl(source: SanityImageSource) {
  return urlFor(source).width(900).auto("format").quality(75).url()
}
