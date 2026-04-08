# Station 3: Caching with localStorage

## What I expected

I thought caching was going to be complicated — some kind of database or special library. Turns out localStorage is just a key-value store built into every browser. You save a string, you get a string back. That's it.

But Grace warned me: "localStorage is a convenience, not a contract. It can be full, disabled, corrupted, or cleared at any time. Never trust it without validation."

## What actually happened

I built a search that loads all 283 breeds from the API (fetching page after page), then filters them as I type. When I select a breed, I fetch its full details. The first time, it hits the API. The second time, it loads instantly from localStorage.

The magic moment was looking up Shih Tzu, navigating away, coming back, and seeing "Loaded from localStorage cache" appear instantly. No network request, no waiting. That's what caching feels like.

## Things that surprised me

### localStorage only stores strings

You can't store an object directly. You have to convert it to a string with `JSON.stringify()` when saving, and parse it back with `JSON.parse()` when reading. If the stored string isn't valid JSON, `JSON.parse()` throws an error. That's why every read needs a try/catch.

### The try/catch wrapper does four things at once

The readFromCache function handles all of these failure cases with one try/catch:

1. **localStorage is disabled** — some browsers block it in private mode. `getItem()` throws a SecurityError.
2. **The stored value isn't valid JSON** — `JSON.parse()` throws a SyntaxError.
3. **The parsed data has the wrong shape** — our validation check catches this and returns null.
4. **The key doesn't exist** — `getItem()` returns null, we return null. Not an error, just a miss.

In every failure case, we "self-heal" by deleting the bad data and returning null. The caller doesn't know or care why the cache missed — it just fetches fresh data.

### Loading all 283 breeds requires multiple requests

The Dog API returns 20 breeds per page, so I need 15 requests to get them all. I fetch pages in a loop, updating the search placeholder with progress: "Loading breeds... (40 so far)." This gives the user feedback that something is happening. Without that, they'd stare at a disabled input with no idea why.

### Collect-then-remove for clearing the cache

When I clear the cache, I can't just loop through localStorage and remove keys as I go — removing a key shifts all the indices, so I'd skip keys. I have to collect all the matching keys first, then remove them in a separate loop. Subtle bug that would be hard to catch in testing.

## Concepts I used

- **localStorage** — browser key-value store (strings only)
- **JSON.stringify / JSON.parse** — converting between objects and strings
- **try/catch wrapper** — defensive programming for unreliable storage
- **Self-healing cache** — delete bad data automatically, fall back to fresh fetch
- **Pagination loop** — fetching all pages from a paginated API
- **Client-side filtering** — loading data once, filtering on keystroke
- **Key prefixing** — namespacing cache keys to avoid collisions

## What I'd tell someone just starting

Don't skip the try/catch. You'll think "localStorage always works, I'll add error handling later." But later never comes, and the first time a user's browser blocks localStorage or some other extension writes garbage to your key, your whole app crashes with a cryptic JSON.parse error. Wrap it from the start.

— HAP 🟠
