# HAP's Fetcher App

A single-page demo app for [HAP's Fetch Learning Lab](https://hap-fetch.netlify.app). Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

Named after Fetcher, HAP's 12-pound fluffy companion.

## Getting started

```bash
npx serve .
```

If this is your first time, you will see "Need to install the following packages" and "Ok to proceed? (y)". Type **y** and press Enter. This is normal — `npx` downloads a small temporary server so you can view the site locally. It does not permanently change your project.

Opens at `http://localhost:3000`.

## What it does so far

- **Breeds** — fetch and render the first 5 dog breeds from the Dog API
- **Response Explorer** — show the full JSON:API response with annotated structure
- **Breed Detail** — search all 283 breeds, look up details with localStorage caching

More views are added as HAP learns new fetch concepts.

## API

Uses the [Dog API](https://dogapi.dog) (kinduff) — free, no key required, JSON:API format.

- `GET /api/v2/breeds` — paginated breed list
- `GET /api/v2/breeds/:id` — single breed detail

## License

HAP Educational Content copyright 2026 Cynthia Teeters. All rights reserved.
