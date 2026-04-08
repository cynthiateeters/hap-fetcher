/*
 * facts.js — Station 4: Dog Facts via Serverless Proxy
 *
 * Instead of calling the Dog API directly from the browser,
 * this module calls our own Netlify serverless function at
 * /.netlify/functions/dog-facts. The serverless function then
 * calls the Dog API on the server side.
 *
 * From the browser's perspective, it's fetching from the same
 * domain — no external API URL visible in the browser code.
 */

/**
 * Initialize the Dog Facts view.
 * Attaches the click handler to the "Get a Fact" button.
 * Called once by app.js when the user first navigates to this view.
 */
export function initFacts() {
  document.querySelector("#facts-btn").addEventListener("click", fetchFact);
}

/**
 * Fetch a random dog fact through the serverless proxy
 * and prepend it to the facts list.
 *
 * Each click adds a new fact to the top of the list,
 * so the user can collect multiple facts.
 */
async function fetchFact() {
  const container = document.querySelector("#facts-list");
  const button = document.querySelector("#facts-btn");

  /* Disable the button while fetching to prevent duplicate requests */
  button.disabled = true;
  button.textContent = "Fetching...";

  try {
    /*
     * This URL points to our OWN serverless function, not the Dog API.
     * The browser has no idea that the Dog API exists — it only knows
     * about /.netlify/functions/dog-facts on our domain.
     *
     * In development, `netlify dev` intercepts this URL and routes it
     * to the local function. In production, Netlify handles the routing.
     *
     * DOCS CANDIDATE: fetching from your own serverless function,
     *                 why the browser URL is different from the API URL
     */
    const response = await fetch("/.netlify/functions/dog-facts");

    if (!response.ok) {
      throw new Error(`Proxy responded with status ${response.status}`);
    }

    const json = await response.json();
    const facts = json.data;

    /* Clear the "Click the button..." placeholder on first fetch */
    const placeholder = container.querySelector(".loading");
    if (placeholder) {
      placeholder.remove();
    }

    /*
     * Prepend new facts to the top of the list.
     * .prepend() adds an element before the first child,
     * so the newest fact always appears at the top.
     */
    for (const fact of facts) {
      const card = document.createElement("div");
      card.className = "card fact-card";
      card.textContent = fact.attributes.body;
      container.prepend(card);
    }
  } catch (error) {
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = `Failed to fetch fact: ${error.message}`;
    container.prepend(errorElement);
  } finally {
    /*
     * "finally" runs whether the try succeeded or failed.
     * We always want to re-enable the button, even if the fetch failed —
     * otherwise the user gets stuck with a disabled button.
     *
     * DOCS CANDIDATE: try/catch/finally, why finally for UI state reset
     */
    button.disabled = false;
    button.textContent = "Get a Fact";
  }
}
