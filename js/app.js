/*
 * app.js — SPA router
 * Handles hash-based navigation between views.
 * Each view is a <section> in index.html that gets shown/hidden.
 */

import { initBreeds } from "./breeds.js";
import { initExplorer } from "./response.js";
import { initDetail } from "./detail.js";
/* Station 4 had: import { initFacts } from "./facts.js";
 * Station 5 replaced the facts proxy with a breeds proxy.
 * The detail view now fetches through the proxy instead of directly. */

/*
 * --- View registry ---
 *
 * This object maps view names (like "home" and "breeds") to their configuration.
 * Each key is a view name. Each value is an object with:
 *   - element:  the DOM node for that view's <section>
 *   - init:     a function to call the first time the view is shown (optional)
 *   - loaded:   tracks whether init has already run (optional)
 *
 * This is an "object of objects" pattern — a common way to organize
 * related data when you need to look things up by name.
 *
 * DOCS CANDIDATE: object-of-objects pattern, when to use it vs an array
 */
const views = {
  home: {
    element: document.querySelector("#view-home"),
  },
  breeds: {
    element: document.querySelector("#view-breeds"),
    init: initBreeds,
    loaded: false,
  },
  explorer: {
    element: document.querySelector("#view-explorer"),
    init: initExplorer,
    loaded: false,
  },
  detail: {
    element: document.querySelector("#view-detail"),
    init: initDetail,
    loaded: false,
  },
};

/**
 * Show a single view and hide all others.
 * Also runs the view's init function on first visit (lazy initialization)
 * and highlights the active nav link.
 *
 * @param {string} name - The view name to show (must match a key in the views object)
 */
function showView(name) {
  /*
   * Look up the view by name using bracket notation.
   * views[name] is like saying "get me the property whose key matches
   * the value of the name variable." If name is "breeds", this returns
   * views.breeds. If the name doesn't match any key, it returns undefined.
   *
   * The || operator here is a fallback — if views[name] is undefined
   * (because someone typed a bad URL hash), fall back to views.home.
   *
   * DOCS CANDIDATE: bracket notation vs dot notation, fallback with ||
   */
  const activeView = views[name] || views.home;

  /*
   * Hide every view by setting hidden = true on each section element.
   * Object.values() returns an array of all the values in the views object.
   * We loop through them and hide each one.
   */
  for (const view of Object.values(views)) {
    view.element.hidden = true;
  }

  /* Then show only the one we want */
  activeView.element.hidden = false;

  /*
   * If this view has an init function and it hasn't run yet, run it now.
   * This is "lazy initialization" — we don't fetch data for a view
   * until the user actually navigates to it.
   */
  if (activeView.init && !activeView.loaded) {
    activeView.init();
    activeView.loaded = true;
  }

  /*
   * Highlight the active nav link.
   * querySelectorAll returns all <a> elements inside #app-nav.
   * classList.toggle adds the "active" class if the condition is true,
   * and removes it if false — so only the current nav link is highlighted.
   *
   * dataset.view reads the data-view attribute from the HTML element.
   * <a data-view="breeds"> becomes navLink.dataset.view === "breeds"
   *
   * DOCS CANDIDATE: dataset attributes, classList.toggle with a condition
   */
  for (const navLink of document.querySelectorAll("#app-nav a")) {
    navLink.classList.toggle("active", navLink.dataset.view === name);
  }
}

/**
 * Read the current URL hash and show the matching view.
 *
 * The URL fragment (the part after #) determines which view is shown.
 * For example: index.html#breeds shows the breeds view.
 * This keeps the app as a single page — no server requests, no page reloads.
 *
 * location.hash returns the fragment including the #, like "#breeds".
 * .slice(1) removes the # to get just "breeds".
 * If there's no hash (first visit), we default to "home".
 *
 * DOCS CANDIDATE: what is a URL hash, how SPA routing works
 */
function handleRoute() {
  const hash = location.hash.slice(1) || "home";
  showView(hash);
}

/*
 * The hashchange event fires when the URL fragment changes —
 * this includes clicking nav links, using browser back/forward buttons,
 * or manually editing the URL.
 */
window.addEventListener("hashchange", handleRoute);

/*
 * --- Click handler for navigation links ---
 *
 * Instead of adding a click handler to every single nav link,
 * we add ONE handler to the entire document. When any click happens,
 * we check if the clicked element (or a parent) has a data-view attribute.
 * This pattern is called "event delegation."
 *
 * .closest("[data-view]") walks up the DOM tree from the clicked element
 * looking for any ancestor with a data-view attribute. Returns null if
 * none is found.
 *
 * DOCS CANDIDATE: event delegation, .closest(), why one handler beats many
 */
document.addEventListener("click", (event) => {
  const clickedLink = event.target.closest("[data-view]");
  if (clickedLink) {
    /*
     * Prevent the default link behavior (which would scroll to the hash
     * target) and update the hash ourselves. This triggers the hashchange
     * event, which calls handleRoute, which calls showView.
     */
    event.preventDefault();
    const viewName = clickedLink.dataset.view;
    location.hash = viewName;
  }
});

/*
 * --- Grand Reveal ---
 * The reveal button shows HAP and Fetcher together.
 * Once revealed, the button hides so it can't be clicked again.
 */
const revealButton = document.querySelector("#reveal-btn");
const revealContent = document.querySelector("#reveal-content");

if (revealButton && revealContent) {
  revealButton.addEventListener("click", () => {
    revealContent.hidden = false;
    revealButton.hidden = true;
  });
}

/* Show the correct view on initial page load */
handleRoute();
