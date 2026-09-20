'use server';

import { db } from '@/lib/db';
import { jobPosting } from '@/lib/db/schema';
import { getUserId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function importJob(input: {
  title: string;
  company: string;
  url: string;
  location?: string;
  description?: string;
  source?: string;
}) {
  const userId = await getUserId();

  if (!input.title.trim() || !input.company.trim() || !input.url.trim()) {
    return { ok: false, error: 'Title, company, and URL are required.' };
  }

  const result = await db.insert(jobPosting).values({
    userId,
    title: input.title.trim(),
    company: input.company.trim(),
    url: input.url.trim(),
    location: input.location?.trim() || null,
    description: input.description?.trim() || null,
    source: input.source?.trim() || 'extension',
  }).returning({ id: jobPosting.id });

  revalidatePath('/dashboard/applications');
  revalidatePath('/dashboard');

  return { ok: true, jobId: result[0]?.id };
}
