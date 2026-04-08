# Station 2: Reading the response

## What I expected

After Station 1, I thought I understood fetch. Request goes out, data comes back, done. But when I actually looked at the full response from the Dog API, I realized I'd been ignoring most of it. In Station 1, I went straight to `json.data` and started pulling out breed names. I never stopped to understand what the rest of the response was doing there.

## What actually happened

The Dog API uses something called JSON:API format. The response isn't just an array of breeds — it's a structured envelope with multiple sections:

- **data** — the actual breed objects, each wrapped in `{ id, type, attributes, relationships }`
- **meta** — pagination info (what page you're on, how many total records exist)
- **links** — URLs for the current page, next page, and last page

The breed information I actually need is buried two levels deep: `data[].attributes`. Everything else is metadata about the response itself.

## Things that surprised me

### The response shape doesn't match my UI

I wanted a list of breed names and descriptions. The API gave me a paginated envelope with resource objects, relationship references, and navigation links. The shape of the data I receive is completely different from the shape my UI needs. I have to transform it.

Prof. Teeters says this is normal — it's called "response shape mapping" and it happens with almost every API. The API is designed for many different consumers, not just my little breed list.

### JSON.stringify with indentation is a debugging tool

When I used `JSON.stringify(json, null, 2)`, the `null, 2` part made it human-readable. The `null` means "don't filter any properties" and the `2` means "indent with 2 spaces." Without that, the whole response shows up as one unreadable line. I use this every time I need to understand what an API returned.

### Pagination means I don't get everything at once

The Dog API has 283 breeds, but one request only returns a page of them. The `meta.pagination` object tells me there are 95 pages (at 3 per page). The `links` object gives me the URL for the next page. This means if I want all breeds, I'd have to make multiple requests — one for each page. Station 3 will deal with that.

## Concepts I used

- **JSON:API format** — a standardized response structure with data, meta, and links
- **Response shape mapping** — transforming API data into the shape your UI needs
- **Destructuring** — pulling specific properties from nested objects
- **JSON.stringify(value, null, 2)** — pretty-printing JSON for debugging
- **DOM tokenization** — splitting text into typed tokens for syntax highlighting

## What I'd tell someone just starting

Before you start building your UI, fetch the data and log it. Look at the actual response. Understand its shape before you try to use it. The five minutes you spend reading the response will save you an hour of debugging "why is my data undefined."

— HAP 🟠
