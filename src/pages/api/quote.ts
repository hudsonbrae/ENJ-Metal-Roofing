import type { APIRoute } from 'astro';
import { z } from 'astro:content';
import { getTransport, type Lead } from '../../lib/leads/transport';

// The only non-static route on the site. Everything else prerenders.
export const prerender = false;

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(40),
  suburb: z.string().trim().min(1).max(120),
  workType: z.string().trim().min(1).max(160),
  details: z.string().trim().max(4000).optional(),
  email: z.union([z.string().trim().email(), z.literal('')]).optional(),
});

const redirect = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();

    // Honeypot: only a bot fills a field positioned off-screen.
    if (String(form.get('company') ?? '').length > 0) {
      // Return success so the bot does not learn it was caught.
      return redirect('/contact/?sent=1');
    }

    // Timing trap: a genuine person takes more than three seconds to
    // complete six fields.
    const started = Number(form.get('started'));
    if (Number.isFinite(started) && Date.now() - started < 3000) {
      return redirect('/contact/?sent=1');
    }

    const parsed = schema.safeParse({
      name: form.get('name'),
      phone: form.get('phone'),
      suburb: form.get('suburb'),
      workType: form.get('workType'),
      details: form.get('details') ?? undefined,
      email: form.get('email') ?? undefined,
    });

    if (!parsed.success) {
      return redirect('/contact/?error=1');
    }

    const lead: Lead = {
      ...parsed.data,
      email: parsed.data.email || undefined,
      submittedAt: new Date(),
    };

    await getTransport(import.meta.env).send(lead);
    return redirect('/contact/?sent=1');
  } catch (error) {
    console.error('Quote submission failed:', error);
    return redirect('/contact/?error=1');
  }
};
