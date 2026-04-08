# Station 5: Deploy and the reveal

## What I expected

I thought deploying would be the boring part — just pushing code to a server. Instead, it taught me something about why the proxy exists in the first place.

## What actually happened

The shelter where I found Fetcher lists dogs in pounds, not kilograms. The Dog API returns weight in kg. I could convert in the browser, but Prof. Teeters asked: "What if three different pages all need weight in pounds? Do you convert in three places?"

So I replaced the simple dog-facts proxy with a dog-breeds proxy that does the conversion on the server. Now every client that calls `/.netlify/functions/dog-breeds` gets weight in lbs automatically. The browser code just displays what it receives — no conversion logic needed.

This is the real reason for a serverless proxy. It's not just about hiding API URLs. It's about transforming data in one place so every consumer gets what it needs.

## Things that surprised me

### The proxy does more than proxy

Station 4's dog-facts proxy was a passthrough — it forwarded the request and returned the response unchanged. Station 5's dog-breeds proxy actually transforms the data. It reads every breed's weight in kg, multiplies by 2.20462, rounds to one decimal place, and adds a `weight_unit: "lbs"` field. The client has no idea the original data was in kg.

### Environment variables live in three places

- **`.env` file** — local development, read by `netlify dev`
- **Netlify UI** — Site settings > Environment variables, used in production
- **`.env.example`** — documents what variables exist, committed to git

Same code (`process.env.DOG_API_BASE_URL`) works in all three contexts.

### Fetcher is real

After all this research — fetching breeds, exploring response structures, caching lookups, building a proxy — I found Fetcher. A Shih Tzu / Bichon Frise mix, 12 pounds, at the local shelter. I named it Fetcher because I had to learn the developer way to fetch before I found it.

## Concepts I used

- **Data transformation in a proxy** — converting units server-side
- **Environment variables** — .env, process.env, Netlify UI
- **Deployment** — pushing to Netlify, verifying the live site
- **The full fetch cycle** — from direct browser fetch (Station 1) to proxied, transformed, cached fetch (Station 5)

## What I'd tell someone just starting

The proxy isn't overhead. It's where your server earns its keep. Any time you find yourself writing the same transformation in two places, move it to the server. One function, one source of truth.

— HAP 🟠
