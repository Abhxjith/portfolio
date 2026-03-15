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
  projectId,
  dataset,
}

export const client = (isSanityConfigured ? realClient : mockClient) as ReturnType<typeof createClient>
