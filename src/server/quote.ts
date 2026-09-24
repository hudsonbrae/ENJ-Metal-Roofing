import type { APIRoute } from 'astro';
import { z } from 'astro:content';
import { getTransport, type Lead } from '../lib/leads/transport';
import { NOT_SENT, THANK_YOU } from '../lib/leads/routes';
import { url } from '../lib/paths';

// The only on-demand route on the site; everything else prerenders.
// Registered at /api/quote by astro.config.mjs, which leaves it out of the
// static GitHub Pages test build (there is no server there to run it).

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(120),
  phone: z
    .string()
    .trim()
    .min(8, 'Enter a phone number we can call you back on.')
    .max(40)
    .regex(/^[+\d\s()-]+$/, 'Use digits only, for example 0412 345 678.'),
  suburb: z.string().trim().min(2, 'Enter the suburb the property is in.').max(120),
  workType: z.string().trim().min(1, 'Choose the type of work.').max(160),
  details: z.string().trim().max(4000).optional(),
  email: z.union([z.string().trim().email('Check the email address.'), z.literal('')]).optional(),
});

/**
 * Browsers without JavaScript post the form normally and get a redirect.
 * The enhanced form asks for JSON so it can show errors inline without
 * losing what the visitor typed.
 */
function respond(request: Request, outcome: 'sent' | 'invalid' | 'failed', errors?: Record<string, string>) {
  const wantsJson = request.headers.get('accept')?.includes('application/json');

  if (wantsJson) {
    const status = outcome === 'sent' ? 200 : outcome === 'invalid' ? 422 : 500;
    return Response.json(
      { ok: outcome === 'sent', redirect: outcome === 'sent' ? url(THANK_YOU) : undefined, errors },
      { status },
    );
  }

  const location = url(outcome === 'sent' ? THANK_YOU : NOT_SENT);
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, 'invalid');
  }

  // Honeypot and timing trap. Report success so a bot learns nothing.
  const honeypot = String(form.get('company') ?? '');
  const started = Number(form.get('started'));
  const tooFast = Number.isFinite(started) && started > 0 && Date.now() - started < 3000;
  if (honeypot.length > 0 || tooFast) {
    return respond(request, 'sent');
  }

  const parsed = schema.safeParse({
    name: form.get('name') ?? '',
    phone: form.get('phone') ?? '',
    suburb: form.get('suburb') ?? '',
    workType: form.get('workType') ?? '',
    details: form.get('details') ?? undefined,
    email: form.get('email') ?? undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      errors[field] ??= issue.message;
    }
    return respond(request, 'invalid', errors);
  }

  const lead: Lead = {
    ...parsed.data,
    email: parsed.data.email || undefined,
    submittedAt: new Date(),
  };

  try {
    await getTransport(import.meta.env).send(lead);
  } catch (error) {
    console.error('Quote delivery failed:', error);
    return respond(request, 'failed');
  }

  return respond(request, 'sent');
};
