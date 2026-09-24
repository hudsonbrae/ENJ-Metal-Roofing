/**
 * Homepage copy for two sections. General roofing facts, not claims about
 * ENJ: nothing here promises a result or states experience.
 */

/** "Worried about your roof?": signs a roof needs attention. */
export const concerns = [
  {
    title: 'Rust',
    body: 'Rust spreads from laps, cut edges and fixings. Once it eats through, water gets into the ceiling below.',
  },
  {
    title: 'Leaks',
    body: 'A stain on the ceiling is usually the last sign. Water can run along a batten for metres before it shows.',
  },
  {
    title: 'Loose or rusted screws',
    body: 'Washers perish in the sun and salt. A lifting screw lets water in and lets the sheet move in the wind.',
  },
  {
    title: 'Blocked gutters and valleys',
    body: 'Leaves hold water against the steel and push it back under the sheets in heavy rain.',
  },
  {
    title: 'Storm damage',
    body: 'Wind and falling branches lift sheets and bend flashings, often where you can\'t see from the ground.',
  },
] as const;

/** "Roofs that last": what the roof has to stand up to. */
export const conditions = [
  {
    title: 'Salt air',
    body: 'Near the coast, salt settles on the roof and eats into the steel. Steel graded for your distance from the sea slows that down.',
  },
  {
    title: 'Coastal wind',
    body: 'Strong gusts try to lift the sheets, so they need fixing to the manufacturer\'s pattern for your site\'s wind rating.',
  },
  {
    title: 'Bushfire',
    body: 'Much of the Shoalhaven is bushfire prone. Steel sheeting doesn\'t burn, and ridges and gutters can be sealed against embers.',
  },
  {
    title: 'Heavy rain',
    body: 'Gutters and valleys need to be sized for the roof they drain, or water overflows in a downpour.',
  },
] as const;
