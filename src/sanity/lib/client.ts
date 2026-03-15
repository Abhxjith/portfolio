import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, isSanityConfigured } from '../env'

const realClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

const mockClient = {
  fetch: () => Promise.resolve([]),
  withConfig: () => mockClient,
}

export const client = isSanityConfigured ? realClient : mockClient
