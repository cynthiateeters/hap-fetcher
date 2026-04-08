# HAP's Fetcher App

A single-page demo app for [HAP's Fetch Learning Lab](https://hap-fetch.netlify.app). Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

Named after Fetcher, HAP's 12-pound fluffy companion.

## Getting started

### Stations 1-3 (no serverless functions)

```bash
npx serve .
```

If this is your first time, you will see "Need to install the following packages" and "Ok to proceed? (y)". Type **y** and press Enter. This is normal — `npx` downloads a small temporary server so you can view the site locally. It does not permanently change your project.

Opens at `http://localhost:3000`.

### Stations 4-5 (with serverless functions)

```bash
cp .env.example .env
netlify dev
```

Opens at `http://localhost:8888`. The Dog Facts view requires `netlify dev` because it calls a serverless function that only runs on a server, not in a static file server.

Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/) first: `npm install -g netlify-cli`

## What it does

Five demo views, each matching a Learning Lab station:

- **Breeds** — fetch and render the first 5 dog breeds from the Dog API
- **Response Explorer** — show the full JSON:API response with annotated structure
- **Breed Detail** — search all 283 breeds, look up details with localStorage caching
- **Dog Facts** — fetch random facts through a Netlify serverless proxy

## Branches

Each branch is a snapshot of the app at a specific station in the Learning Lab:

| Branch               | What's included                                         |
| -------------------- | ------------------------------------------------------- |
| `station-1`          | Breeds view only, `npx serve .`                         |
| `station-2`          | + Response Explorer                                     |
| `station-3`          | + Breed Detail with search and cache                    |
| `station-4`          | + Dog Facts via serverless proxy, `netlify dev`         |
| `station-5` / `main` | + Breeds proxy with kg-to-lbs conversion, deploy config |

## API

Uses the [Dog API](https://dogapi.dog) (kinduff) — free, no key required, JSON:API format.

- `GET /api/v2/breeds` — paginated breed list
- `GET /api/v2/breeds/:id` — single breed detail
- `GET /api/v2/facts` — random dog facts

## Environment variables

| Variable           | Purpose                                                 | Default                     |
| ------------------ | ------------------------------------------------------- | --------------------------- |
| `DOG_API_BASE_URL` | Base URL for the Dog API (used by serverless functions) | `https://dogapi.dog/api/v2` |

## Deploy your own

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cynthiateeters/hap-fetcher)

## API attribution

This app uses the [Dog API](https://dogapi.dog) by [kinduff](https://buymeacoffee.com/kinduff). Free, no key required, beautifully structured. Buy them a coffee if you find it useful.

## License

HAP Educational Content copyright 2026 Cynthia Teeters. All rights reserved.
