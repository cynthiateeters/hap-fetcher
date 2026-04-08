# Station 4: Serverless proxy

## What I expected

I thought "serverless" meant there was no server. Turns out it means you don't manage the server — Netlify runs your code on their infrastructure. You write a function, they handle the rest. It's still a server. You just don't see it.

## What actually happened

I moved the Dog API call from the browser to a Netlify function. Instead of the browser calling `https://dogapi.dog/api/v2/facts` directly, it now calls `/.netlify/functions/dog-facts` — a URL on my own domain. My function receives the request, calls the Dog API on the server, and sends the response back to the browser.

From the browser's perspective, nothing changed. A fetch is a fetch. The only difference is the URL it calls.

## Things that surprised me

### The function uses the same fetch() as the browser

I expected server-side code to need a special library. But Node.js 18+ has native `fetch()` built in — the same API the browser uses. No packages to install. No `require('node-fetch')`. Just `fetch()`.

Prof. Teeters told me that older Node.js tutorials will tell me to install `node-fetch` or `axios`. That advice is outdated. Native fetch is built in, has zero dependencies, and doesn't expose me to supply chain attacks on third-party packages.

### .mjs means ES modules

The function file is `dog-facts.mjs`, not `dog-facts.js`. The `.mjs` extension tells Node.js to use ES module syntax (import/export). Without it, Node assumes CommonJS (require/module.exports) and the Netlify CLI shows a deprecation warning.

### Environment variables have three homes

The API base URL lives in three places depending on the context:

1. **`.env` file** — for local development. Read by `netlify dev` automatically.
2. **Netlify UI** — Site settings > Environment variables. Used in production.
3. **`.env.example`** — documents what variables exist, committed to git (without real values).

The function reads it with `process.env.DOG_API_BASE_URL`. Same code works in all three contexts because Netlify injects the variables regardless of where they're defined.

### `netlify dev` replaces `npx serve`

Stations 1-3 used `npx serve .` for local development. That still serves static files, but it doesn't run serverless functions. Starting with Station 4, I use `netlify dev` instead. It does everything `serve` does plus intercepts `/.netlify/functions/*` URLs and routes them to my local functions.

## Concepts I used

- **Serverless functions** — server-side code without managing a server
- **Proxy pattern** — browser calls your endpoint, your endpoint calls the external API
- **Environment variables** — configuration that changes between environments
- **process.env** — how Node.js reads environment variables
- **.mjs extension** — opt-in to ES modules in Node.js
- **502 Bad Gateway** — the right HTTP status when your proxy can't reach the upstream server
- **try/catch/finally** — finally block for resetting UI state regardless of success or failure

## What I'd tell someone just starting

The proxy might feel like unnecessary complexity — "why not just call the API from the browser?" For a free, keyless API like the Dog API, direct calls are fine. But the moment you have an API key, a rate limit, or any secret, you need this pattern. Build the habit now with a simple case so it's automatic when the stakes are higher.

— HAP 🟠
