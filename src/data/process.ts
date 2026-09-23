/**
 * How a job runs, as shown on the homepage.
 *
 * Kept deliberately plain: it describes the order of events, not promises
 * about timing, cleanup or guarantees. ENJ has not yet confirmed that this
 * matches how they work, so `confirmed` is false and the section only
 * appears in review mode. Set it to true once ENJ signs off on the wording.
 */
export const processConfirmed = false;

export const processSteps = [
  {
    title: 'Get in touch',
    body: 'Call, or send the address and what needs doing through the quote form.',
  },
  {
    title: 'Roof inspection',
    body: 'A look at the roof itself before anything is priced: its structure, pitch, condition and access.',
  },
  {
    title: 'Free quote',
    body: 'A quote for the work, covering the materials and what the job includes.',
  },
  {
    title: 'The work',
    body: 'The existing roof removed where needed and the new roof, flashings and gutters installed.',
  },
] as const;
