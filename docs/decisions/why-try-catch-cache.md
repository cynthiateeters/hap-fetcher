# Why try/catch around every localStorage operation

## The choice

There are two ways to use localStorage:

```javascript
/* Optimistic — assumes everything works */
const data = JSON.parse(localStorage.getItem("breed-abc123"));
renderBreed(data);

/* Defensive — wraps in try/catch with validation */
try {
  const raw = localStorage.getItem("breed-abc123");
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (!parsed || !parsed.attributes || !parsed.attributes.name) {
    localStorage.removeItem("breed-abc123");
    return null;
  }
  return parsed;
} catch {
  localStorage.removeItem("breed-abc123");
  return null;
}
```

I use the defensive version. Every time.

## Why

localStorage is a trust boundary. The data stored there could be:

- **Missing** — the key was never set, or the user cleared their browser data
- **Corrupted** — a browser extension or other script wrote garbage to the key
- **Wrong shape** — a previous version of the app stored data in a different format
- **Unparseable** — the string isn't valid JSON (partial write, encoding issue)

And localStorage itself might be:

- **Disabled** — some browsers block it in private/incognito mode
- **Full** — the 5-10 MB quota is shared across all scripts on the domain

The optimistic version crashes on any of these. The defensive version handles all of them and falls back to a fresh API fetch.

## The self-healing part

When we detect bad data, we don't just return null — we also delete the bad key. This means the next attempt starts clean instead of hitting the same bad data again. Grace called this "self-healing" and said it's a production pattern. If you can't fix the data, remove it so the system can recover.

## When this pattern comes back

Prof. Teeters told me this exact wrapper pattern appears again when storing conversation history. Any time you persist data in the browser and read it back later, you need this pattern. The specific validation changes (checking for attributes.name vs checking for messages array), but the try/catch + validate + self-heal structure stays the same.

— HAP 🟠
