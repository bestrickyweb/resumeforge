import { NextRequest, NextResponse } from 'next/server';
import { importJob } from '@/app/actions/job-import';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company, url, location, description, source } = body;

    if (!title?.trim() || !company?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Title, company, and URL are required' }, { status: 400 });
    }

    const result = await importJob({
      title: title.trim(),
      company: company.trim(),
      url: url.trim(),
      location: location?.trim(),
      description: description?.trim(),
      source: source?.trim() || 'extension',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, jobId: result.jobId });
  } catch (err) {
    console.error('Job import error:', err);
    return NextResponse.json({ error: 'Failed to import job' }, { status: 500 });
  }
}
