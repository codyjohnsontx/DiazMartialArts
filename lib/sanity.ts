import 'server-only';
import { createClient } from '@sanity/client';
import groq from 'groq';
import { readRequiredString } from '@/lib/env';

export type Announcement = {
  _id: string;
  title: string;
  eventDate: string; // ISO 8601
  description?: string;
  pdfUrl: string;
  previewImageUrl?: string;
};

export const sanityClient = createClient({
  projectId: readRequiredString(
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'your-project-id from sanity.io/manage',
  ),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function getAnnouncements(): Promise<Announcement[]> {
  return sanityClient.fetch(
    groq`*[_type == "announcement"] | order(eventDate asc) {
      _id,
      title,
      eventDate,
      description,
      "pdfUrl": pdfFile.asset->url,
      "previewImageUrl": previewImage.asset->url
    }`,
    {},
    { cache: 'no-store' },
  );
}
