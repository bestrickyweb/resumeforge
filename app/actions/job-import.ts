'use server';

import { db } from '@/lib/db';
import { jobPosting } from '@/lib/db/schema';
import { getUserId } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { getUsage } from '@/app/actions/queries';
import { recordUsage } from '@/lib/usage';

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

  const usage = await getUsage({ fresh: true });
  const imports = usage.features.jobImport;
  if (imports.limit !== Infinity && imports.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Job import is available on Pro and Unlimited plans.'
          : 'You have reached your job import limit for this month.',
    };
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

  await recordUsage(userId, 'jobImport');

  revalidatePath('/dashboard/applications');
  revalidatePath('/dashboard');

  return { ok: true, jobId: result[0]?.id };
}
