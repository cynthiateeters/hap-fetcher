# Station 1: First fetch

## What I expected

I thought fetching data from the internet would be like reading a file — you ask for it, you get it, done. Prof. Teeters warned me it's more like ordering food at a restaurant. You place the order (fetch), wait for it to be prepared (the network request), and then it arrives (the response). Sometimes the kitchen is closed (server error). Sometimes they're out of what you ordered (404).

## What actually happened

The data came back, but it wasn't in the shape I expected. I asked for dog breeds and got this big nested object with `data`, `meta`, `links`, `relationships` — way more structure than I needed. The breed names and descriptions were buried inside `data[].attributes`. That was my first lesson: APIs don't hand you exactly what you need. You have to dig for it.

## Things that surprised me

### async/await is just waiting for promises

I was scared of async/await at first. But it's really just telling JavaScript "pause here until this thing finishes." Without it, the code would keep running before the data arrived, and I'd be trying to display breeds that don't exist yet.

### fetch() doesn't throw errors on 404 or 500

This one got me. I assumed if the server returned an error, fetch would throw an error. Nope. fetch() only throws if the network completely fails (like no internet). A 404 or 500 response is still a "successful" network request — the server responded, just not with what you wanted. That's why I have to check `response.ok` myself.

### textContent vs innerHTML

Prof. Teeters made me promise to never use innerHTML with data from external sources. The breed descriptions come from an API I don't control. If someone injected malicious HTML into a breed description, innerHTML would execute it. textContent treats everything as plain text — safe but you have to build DOM elements one at a time.

## Concepts I used

- **async/await** — pausing code until a Promise resolves
- **fetch()** — sending HTTP requests from JavaScript
- **response.ok** — checking if the server returned a success status
- **response.json()** — parsing the response body as JSON
- **querySelector** — finding elements using CSS selector syntax
- **createElement / textContent** — building DOM elements safely
- **destructuring** — extracting properties from objects in one line
- **template literals** — building strings with embedded expressions

## What I'd tell someone just starting

Start with the simplest possible fetch. Don't try to handle every error case or build a beautiful UI on day one. Get data to show up on screen first. Then make it better.

— HAP 🟠
