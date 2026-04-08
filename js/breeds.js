/*
 * breeds.js — Station 1: First Fetch
 * HAP's first attempt at asking the internet for data.
 * Fetches dog breeds from the Dog API and renders the first 5 as cards.
 */

/*
 * The API base URL is stored in a constant so we only write it once.
 * If the URL ever changes, we update it in one place.
 */
const API_URL = "https://dogapi.dog/api/v2/breeds";

/**
 * Initialize the breeds view.
 * Called by app.js when the user first visits the Breeds view.
 * The "export" keyword makes this function available to other files
 * that import it.
 *
 * DOCS CANDIDATE: what export/import does, how ES modules connect files
 */
export function initBreeds() {
  fetchBreeds();
}

/**
 * Fetch the first 5 dog breeds from the Dog API and render them as cards.
 *
 * The "async" keyword lets us use "await" inside this function.
 * await pauses the function until a Promise resolves — it makes
 * asynchronous code (like network requests) read like normal code.
 *
 * Without async/await, we would need nested .then() callbacks,
 * which are harder to read and debug.
 *
 * DOCS CANDIDATE: async/await vs .then() chains, what is a Promise
 */
async function fetchBreeds() {
  /*
   * querySelector uses CSS selector syntax to find elements in the page.
   * The # means "find the element with this id attribute."
   * This returns the <div id="breed-list"> from index.html.
   */
  const container = document.querySelector("#breed-list");

  /*
   * try/catch wraps code that might fail. If anything inside "try" throws
   * an error, execution jumps to the "catch" block instead of crashing.
   * Network requests can fail for many reasons: no internet, server down,
   * bad URL, unexpected response format.
   *
   * DOCS CANDIDATE: try/catch for network requests, why not let errors crash
   */
  try {
    /*
     * fetch() sends an HTTP request and returns a Promise that resolves
     * to a Response object. The await keyword pauses here until the
     * response arrives from the server.
     *
     * Template literals (backtick strings) let us embed expressions
     * with ${...} — here we build the full URL with query parameters.
     *
     * The Dog API uses pagination — page[number] and page[size] control
     * which slice of data we get back. We ask for page 1, 5 breeds per page.
     */
    const response = await fetch(`${API_URL}?page[number]=1&page[size]=5`);

    /*
     * IMPORTANT: fetch() does NOT throw an error for HTTP error statuses
     * like 404 (not found) or 500 (server error). It only throws on
     * actual network failures (no connection, DNS error, etc.).
     *
     * response.ok is true when the status code is 200-299 (success).
     * We check it ourselves and throw an error if something went wrong.
     * Without this check, we would try to parse an error page as JSON
     * and get a confusing error message instead of a clear one.
     *
     * DOCS CANDIDATE: response.ok, why fetch doesn't throw on 404/500
     */
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    /*
     * response.json() reads the response body and parses it as JSON.
     * This also returns a Promise (reading the body takes time),
     * so we await it too. The result is a plain JavaScript object.
     */
    const json = await response.json();

    /*
     * --- Understanding the JSON:API response format ---
     *
     * The Dog API uses a format called JSON:API. The data we want is NOT
     * at the top level of the response. It is nested like this:
     *
     *   {
     *     data: [                          <-- array of breed objects
     *       {
     *         id: "abc-123",
     *         type: "breed",
     *         attributes: {                <-- the actual breed info
     *           name: "Affenpinscher",
     *           description: "...",
     *           life: { min: 14, max: 16 },
     *           hypoallergenic: true
     *         }
     *       },
     *       ...
     *     ],
     *     meta: { pagination: { ... } },   <-- page info
     *     links: { ... }                   <-- URLs for next/prev pages
     *   }
     *
     * We need json.data to get the array of breeds.
     * Then for each breed, we dig into breed.attributes for the details.
     *
     * DOCS CANDIDATE: JSON:API format, why APIs nest data, response shape mapping
     */
    const breeds = json.data;

    /*
     * Clear the "Loading breeds..." placeholder.
     * textContent = "" removes all child nodes safely.
     * We use textContent (not innerHTML) because it cannot execute scripts —
     * this matters when displaying data from external sources.
     */
    container.textContent = "";

    /*
     * Build a card for each breed using DOM creation methods.
     * We use createElement + textContent instead of innerHTML because
     * data from external APIs should never be inserted as raw HTML.
     * If the API were compromised and returned malicious HTML in a breed name,
     * innerHTML would execute it. textContent treats everything as plain text.
     *
     * DOCS CANDIDATE: why createElement over innerHTML, XSS prevention
     */
    for (const breed of breeds) {
      /*
       * Destructuring extracts specific properties from an object.
       * This single line replaces four separate lines:
       *   const name = breed.attributes.name;
       *   const description = breed.attributes.description;
       *   const life = breed.attributes.life;
       *   const hypoallergenic = breed.attributes.hypoallergenic;
       *
       * DOCS CANDIDATE: destructuring assignment, nested property access
       */
      const { name, description, life, hypoallergenic } = breed.attributes;

      const card = document.createElement("div");
      card.className = "card breed-card";

      const heading = document.createElement("p");
      heading.className = "breed-name";
      heading.textContent = name;

      const desc = document.createElement("p");
      desc.textContent = description;

      /* Metadata row (lifespan, hypoallergenic badge) */
      const meta = document.createElement("div");
      meta.className = "breed-meta";

      const lifespan = document.createElement("span");
      /* \u2013 is the unicode en-dash character (–), used for ranges */
      lifespan.textContent = `Lifespan: ${life.min}\u2013${life.max} years`;
      meta.appendChild(lifespan);

      /*
       * Only show the hypoallergenic badge if the breed is hypoallergenic.
       * This is conditional rendering — we only create the element when needed.
       */
      if (hypoallergenic) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Hypoallergenic";
        meta.appendChild(badge);
      }

      /*
       * .append() can add multiple children at once (unlike .appendChild()
       * which only takes one). Both add elements to the end of a parent.
       */
      card.append(heading, desc, meta);
      container.appendChild(card);
    }
  } catch (error) {
    /*
     * If anything in the try block fails — network error, bad status,
     * JSON parse error — we end up here. We show a friendly message
     * to the user instead of a blank screen or a console-only error
     * that they would never see.
     */
    container.textContent = "";
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = `Failed to fetch breeds: ${error.message}`;
    container.appendChild(errorElement);
  }
}
