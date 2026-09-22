/**
 * Lead delivery.
 *
 * The transport is behind an interface so ENJ can switch from console logging
 * (development) to real email (production) by setting environment variables —
 * no code change, no redeploy of application logic.
 *
 * At launch: set RESEND_API_KEY and LEAD_TO_EMAIL, and verify the sending
 * domain with Resend. Until then ConsoleTransport is used automatically.
 */

export interface Lead {
  name: string;
  phone: string;
  suburb: string;
  workType: string;
  details?: string;
  email?: string;
  submittedAt: Date;
}

export interface LeadTransport {
  readonly name: string;
  send(lead: Lead): Promise<void>;
}

function formatLead(lead: Lead): string {
  const lines = [
    `Name:     ${lead.name}`,
    `Phone:    ${lead.phone}`,
    `Suburb:   ${lead.suburb}`,
    `Work:     ${lead.workType}`,
    lead.email ? `Email:    ${lead.email}` : null,
    '',
    lead.details ? lead.details : '(no further details supplied)',
    '',
    `Submitted ${lead.submittedAt.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
    })} (Sydney time)`,
  ];
  return lines.filter((line) => line !== null).join('\n');
}

class ConsoleTransport implements LeadTransport {
  readonly name = 'console';

  async send(lead: Lead): Promise<void> {
    console.log('\n──── NEW ROOFING ENQUIRY ────\n' + formatLead(lead) + '\n');
  }
}

class ResendTransport implements LeadTransport {
  readonly name = 'resend';

  constructor(
    private readonly apiKey: string,
    private readonly to: string,
    private readonly from: string,
  ) {}

  async send(lead: Lead): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [this.to],
        reply_to: lead.email || undefined,
        subject: `Roofing enquiry — ${lead.name}, ${lead.suburb}`,
        text: formatLead(lead),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Resend rejected the message (${response.status}): ${await response.text()}`,
      );
    }
  }
}

export function getTransport(env: Record<string, string | undefined>): LeadTransport {
  const apiKey = env.RESEND_API_KEY;
  const to = env.LEAD_TO_EMAIL;
  const from = env.LEAD_FROM_EMAIL;

  if (apiKey && to && from) {
    return new ResendTransport(apiKey, to, from);
  }
  return new ConsoleTransport();
}
