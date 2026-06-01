// Curated, verified Giphy CDN gifs (no API key — direct media URLs).
// Grouped loosely; the picker shows them all with a simple keyword filter.

export interface Gif {
  id: string;
  tags: string;
}

const GIF_IDS: Gif[] = [
  { id: "3oEjI6SIIHBdRxXI40", tags: "hi hello wave" },
  { id: "l0HlNaQ6gWfllcjDO", tags: "hello hey wave" },
  { id: "26ufdipQqU2lhNA4g", tags: "yes nice approve" },
  { id: "xT0xeJpnrWC4XWblEk", tags: "wow amazing cool" },
  { id: "111ebonMs90YLu", tags: "ok thumbs up" },
  { id: "l4FGI8GoTL7N4Dsyc", tags: "lol laugh funny" },
  { id: "3o7aCSPqXE5C6T8tBC", tags: "yes excited celebrate" },
  { id: "l0MYt5jPR6QX5pnqM", tags: "thumbs up nice good" },
  { id: "26tn33aiTi1jkl6H6", tags: "wow shocked omg" },
  { id: "g9582DNuQppxC", tags: "deal handshake business" },
  { id: "13HgwGsXF0aiGY", tags: "cool sunglasses awesome" },
  { id: "l46Cy1rHbQ92uuLXa", tags: "mind blown wow" },
  { id: "3oz8xLd9DJq2l2VFtu", tags: "party celebrate yay" },
  { id: "24BVkfH7pdJ3ULNQ7L", tags: "love heart nice" },
  { id: "3ohhwfAol3pscv8c8w", tags: "thinking hmm" },
  { id: "26gssIytJvy1b1THO", tags: "dance happy fun" },
  { id: "3o85xnoIXebk3ss5Ww", tags: "bye goodbye wave" },
];

export const GIFS: { id: string; tags: string; preview: string; full: string }[] = GIF_IDS.map((g) => ({
  ...g,
  preview: `https://media.giphy.com/media/${g.id}/giphy.gif`,
  full: `https://media.giphy.com/media/${g.id}/giphy.gif`,
}));
