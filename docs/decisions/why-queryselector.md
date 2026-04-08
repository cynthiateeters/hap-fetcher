# Why querySelector instead of getElementById

## The choice

There are two ways to find an element by its id in JavaScript:

```javascript
// Older way
document.getElementById("breed-list");

// Modern way
document.querySelector("#breed-list");
```

Both work. Both find the same element. I use querySelector.

## Why

querySelector uses **CSS selector syntax** — the same selectors you already know from writing stylesheets. The `#` means id, `.` means class, and you can combine them just like in CSS.

getElementById only finds elements by id. If I later need to find elements by class, tag, or a complex selector, I'd have to switch to a different method. With querySelector, one method handles everything:

```javascript
document.querySelector("#breed-list"); // by id
document.querySelector(".card"); // by class
document.querySelector("section.view"); // tag + class
document.querySelector("[data-view='breeds']"); // by attribute
```

## What I'd lose by using getElementById

Nothing, really — it works fine for ids. But then my code would mix two different selection approaches, and I'd have to remember which method to use when. One consistent API is easier to learn and read.

## Where I learned this

Grace pointed out that querySelector returns null if the element doesn't exist, just like getElementById. No difference in behavior — just consistency.

— HAP 🟠
