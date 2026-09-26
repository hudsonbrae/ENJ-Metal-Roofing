/**
 * "What happens when you get in touch": the homepage process band.
 *
 * ENJ has confirmed these steps match how they work, so the band shows in
 * every build. Set `processConfirmed` back to false to hide it again.
 */
export const processConfirmed = true;

export const processIntro = {
  title: 'What happens when you get in touch',
  lead: 'From the first phone call to the finished roof, this is how a job runs.',
};

export const processSteps = [
  {
    title: 'Get in touch',
    body: "Call John or Ethan, or send the details through the website. We'll talk through what's going on with your roof and what you're after.",
  },
  {
    title: 'Roof inspection',
    body: "We come out and look at the roof itself: its condition, pitch, structure and access. You can ask questions while we're there.",
  },
  {
    title: 'Free quote',
    body: 'You get a written quote covering the materials and what the job includes, so you know what you are agreeing to.',
  },
  {
    title: 'Installation',
    body: 'The old roof comes off where needed, and the new sheeting, flashings and gutters go on.',
  },
  {
    title: 'Handover',
    body: 'Before we leave, we go over the finished roof with you and answer anything you want to know.',
  },
] as const;
