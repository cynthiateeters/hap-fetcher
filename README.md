# HAP's Fetcher App

A single-page demo app for [HAP's Fetch Learning Lab](https://hap-fetch.netlify.app). Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

Named after Fetcher, HAP's 12-pound fluffy companion.

## Getting started

```bash
cp .env.example .env
netlify dev
```

Opens at `http://localhost:8888`. The Dog Facts view requires `netlify dev` because it calls a serverless function that only runs on a server, not in a static file server.

Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/) first: `npm install -g netlify-cli`

## What it does so far

- **Breeds** — fetch and render the first 5 dog breeds from the Dog API
- **Response Explorer** — show the full JSON:API response with annotated structure
- **Breed Detail** — search all 283 breeds, look up details with localStorage caching
- **Dog Facts** — fetch random facts through a Netlify serverless proxy

More views are added as HAP learns new fetch concepts.

## API

Uses the [Dog API](https://dogapi.dog) (kinduff) — free, no key required, JSON:API format.

- `GET /api/v2/breeds` — paginated breed list
- `GET /api/v2/breeds/:id` — single breed detail
- `GET /api/v2/facts` — random dog facts

## Environment variables

| Variable           | Purpose                                                | Default                     |
| ------------------ | ------------------------------------------------------ | --------------------------- |
| `DOG_API_BASE_URL` | Base URL for the Dog API (used by serverless function) | `https://dogapi.dog/api/v2` |

## License

HAP Educational Content copyright 2026 Cynthia Teeters. All rights reserved.
