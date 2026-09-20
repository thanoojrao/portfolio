# thanooj.vercel.app — portfolio

nLive at **https://thanooj.vercel.app**.
Personal site built around one idea: **exploration vs exploitation**.

The site has two modes. **Exploit** shows the proven work, ordered by confidence.
**Explore** shows the experiments, with a little randomness on every visit.
A toggle and an ε slider switch between them; the hero graph is a live ε-greedy
bandit whose arms are the projects.

## Stack

- [Astro](https://astro.build) static output, [Tailwind 4](https://tailwindcss.com)
- React islands with [Framer Motion](https://www.framer.com/motion/) for the boot
  sequence, mode switch, ε re-sorting, bandit graph and particle drift
- [nanostores](https://github.com/nanostores/nanostores) for the shared policy state
- JetBrains Mono, "Phosphor" palette (green = exploit, amber = explore)

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
```

## Content

All copy lives in `src/data/site.ts`: profile, experience, stack, projects and the
explore/exploit note. Each project has an `exploit` and `explore` score in [0, 1];
the card order is `(1 − ε) · exploit + ε · explore` plus per-visit jitter.

To add a résumé, drop `resume.pdf` in `public/` and set `profile.resume` to `/resume.pdf`.
