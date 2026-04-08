# Why native fetch instead of axios or node-fetch

## The choice

There are three common ways to make HTTP requests in Node.js:

```javascript
/* axios — popular third-party package */
import axios from "axios";
const response = await axios.get("https://dogapi.dog/api/v2/facts");

/* node-fetch — third-party polyfill for older Node.js */
import fetch from "node-fetch";
const response = await fetch("https://dogapi.dog/api/v2/facts");

/* native fetch — built into Node.js 18+ */
const response = await fetch("https://dogapi.dog/api/v2/facts");
```

I use native fetch. No packages. No imports.

## Why

### Zero dependencies means zero supply chain risk

In 2024, the axios npm package was compromised through social engineering. North Korean threat actors convinced a maintainer to hand over access, then injected malicious code into a release that was downloaded by thousands of projects before anyone noticed.

Every package you install is a trust decision. You're trusting the maintainers, their security practices, and every dependency they pull in. Native fetch has no maintainers to compromise and no dependencies to hijack. It's part of the JavaScript runtime itself.

### Same API everywhere

Native fetch in Node.js is the same fetch() API the browser uses. Same syntax, same Response object, same .json() method. Code I write for the browser works on the server without changes. With axios, I'd learn one API for the client and a different one for the server.

### It's already there

Node.js 18 (released April 2022) includes fetch() as a built-in global. There's nothing to install, nothing to keep updated, nothing that can break in a dependency update. If I can write `console.log()` without importing anything, I can write `fetch()` without importing anything.

## When would I use something else?

Honestly, I can't think of a reason for a new project. Older tutorials and AI code generators suggest axios and node-fetch because their training data is full of code from before Node 18. If an AI tool suggests `npm install axios` or `require('node-fetch')`, that's a signal the suggestion is outdated.

## Where I learned this

Prof. Teeters showed me the axios incident report and said: "The safest dependency is the one you don't have."

— HAP 🟠
