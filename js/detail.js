/*
 * detail.js — Station 3: Breed Detail + Caching
 *
 * HAP keeps looking up the same breeds over and over. Grace tells HAP
 * that re-fetching data you already have is wasteful — and shows how
 * to cache API responses in localStorage.
 *
 * But localStorage can't be trusted: bad data, stale data, corrupted JSON.
 * So we wrap every read in a try/catch that validates the data shape
 * and self-heals on failure (deletes bad data, falls back to a fresh fetch).
 *
 * This same wrapper pattern gets reused later for conversation history.
 */

const API_URL = "https://dogapi.dog/api/v2/breeds";

/*
 * Cache key prefix — all cached breeds use this prefix + the breed ID.
 * This makes it easy to find and clear all cached breeds without
 * accidentally deleting other localStorage data.
 *
 * DOCS CANDIDATE: namespacing localStorage keys, why prefixes matter
 */
const CACHE_KEY_PREFIX = "hap-fetcher-breed-";

/*
 * This array holds all breeds loaded from the API.
 * We load them once (across multiple paginated requests) and then
 * filter client-side as the user types. This avoids hitting the API
 * on every keystroke.
 *
 * "let" instead of "const" because the array starts empty and gets
 * populated asynchronously after the page loads.
 */
let allBreeds = [];

/**
 * Initialize the Breed Detail view.
 * Starts loading all breeds in the background and sets up event listeners.
 * Called once by app.js when the user first navigates to this view.
 */
export function initDetail() {
  loadAllBreeds();

  const searchInput = document.querySelector("#breed-search");
  const resultsList = document.querySelector("#breed-results");

  /*
   * "input" event fires every time the search field value changes —
   * on every keystroke, paste, or deletion. We filter the breed list
   * on each change so results update as the user types.
   */
  searchInput.addEventListener("input", () => {
    filterBreeds(searchInput.value.trim());
  });

  /*
   * Re-show results when the input is focused (if there's text in it).
   * This handles the case where the user clicked away to close the
   * results, then clicked back on the input.
   */
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) {
      filterBreeds(searchInput.value.trim());
    }
  });

  /*
   * Close the results dropdown when clicking anywhere outside of it.
   * .closest() checks if the click target is inside the search input
   * or the results list — if not, we hide the results.
   *
   * DOCS CANDIDATE: click-outside pattern for dropdowns
   */
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#breed-search") && !event.target.closest("#breed-results")) {
      resultsList.hidden = true;
    }
  });

  /* Let users close the dropdown with the Escape key */
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resultsList.hidden = true;
    }
  });

  document.querySelector("#clear-cache").addEventListener("click", clearCache);
}

/**
 * Load all breeds from the Dog API by fetching every page.
 *
 * The API paginates results (20 per page by default), so we need
 * multiple requests to get all 283 breeds. We fetch pages sequentially
 * and update the search input placeholder with progress so the user
 * knows something is happening.
 *
 * Once all breeds are loaded, we sort them alphabetically and enable
 * the search input.
 */
async function loadAllBreeds() {
  const searchInput = document.querySelector("#breed-search");

  try {
    let page = 1;

    /*
     * Keep fetching pages until there are no more.
     * The API's meta.pagination.next is null on the last page.
     */
    while (true) {
      const response = await fetch(`${API_URL}?page[number]=${page}&page[size]=20`);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const json = await response.json();

      /*
       * For each breed on this page, store just what we need for the
       * search dropdown: id, name, and average weight.
       * We calculate average weight here so we can show it next to
       * each result — this helps HAP compare breeds by size.
       */
      for (const breed of json.data) {
        allBreeds.push({
          id: breed.id,
          name: breed.attributes.name,
          averageWeight: (breed.attributes.male_weight.min + breed.attributes.male_weight.max) / 2,
        });
      }

      /* Update the placeholder so the user sees loading progress */
      searchInput.placeholder = `Loading breeds... (${allBreeds.length} so far)`;

      /*
       * If there's no next page, we've loaded everything.
       * The pagination object has a "next" property that is null
       * on the last page and a page number on all other pages.
       */
      if (!json.meta.pagination.next) break;
      page++;
    }

    /*
     * Sort breeds alphabetically by name using localeCompare,
     * which handles special characters and accents correctly.
     */
    allBreeds.sort((breedA, breedB) => breedA.name.localeCompare(breedB.name));

    searchInput.placeholder = `Search ${allBreeds.length} breeds...`;
    searchInput.disabled = false;
  } catch {
    searchInput.placeholder = "Failed to load breeds";
  }
}

/**
 * Filter the loaded breeds by name and display matching results.
 * Limits results to 15 to keep the dropdown manageable.
 *
 * @param {string} query - The search text to filter by
 */
function filterBreeds(query) {
  const resultsList = document.querySelector("#breed-results");

  if (query.length === 0) {
    resultsList.hidden = true;
    return;
  }

  /*
   * Case-insensitive search — convert both the query and breed name
   * to lowercase before comparing. .includes() checks if the query
   * appears anywhere in the breed name (not just the start).
   */
  const lowerQuery = query.toLowerCase();
  const matches = allBreeds.filter((breed) => breed.name.toLowerCase().includes(lowerQuery));

  resultsList.textContent = "";

  if (matches.length === 0) {
    const noResults = document.createElement("li");
    noResults.textContent = "No breeds found";
    noResults.setAttribute("aria-disabled", "true");
    resultsList.appendChild(noResults);
  } else {
    /* Show at most 15 results to keep the dropdown usable */
    for (const breed of matches.slice(0, 15)) {
      const listItem = document.createElement("li");
      listItem.setAttribute("role", "option");
      listItem.setAttribute("tabindex", "0");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = breed.name;

      const weightSpan = document.createElement("span");
      weightSpan.className = "breed-results-weight";
      weightSpan.textContent = `~${breed.averageWeight} kg`;

      listItem.append(nameSpan, weightSpan);

      listItem.addEventListener("click", () => selectBreed(breed.id));
      listItem.addEventListener("keydown", (event) => {
        if (event.key === "Enter") selectBreed(breed.id);
      });

      resultsList.appendChild(listItem);
    }
  }

  resultsList.hidden = false;
}

/**
 * Handle selecting a breed from the search results.
 * Updates the search input text and triggers the detail fetch.
 *
 * @param {string} breedId - The UUID of the selected breed
 */
function selectBreed(breedId) {
  const searchInput = document.querySelector("#breed-search");
  const resultsList = document.querySelector("#breed-results");
  const breed = allBreeds.find((breed) => breed.id === breedId);

  if (breed) {
    searchInput.value = breed.name;
  }
  resultsList.hidden = true;

  fetchBreedDetail(breedId);
}

/**
 * Fetch a single breed's full details, checking the cache first.
 *
 * This is the core caching pattern:
 * 1. Try to read from localStorage cache
 * 2. If cached data exists and is valid, use it (cache hit)
 * 3. If not cached or invalid, fetch from the API (cache miss)
 * 4. Save the fresh data to cache for next time
 *
 * DOCS CANDIDATE: caching strategy, cache hit vs miss, when to cache
 *
 * @param {string} breedId - The UUID of the breed to look up
 */
async function fetchBreedDetail(breedId) {
  const detailContainer = document.querySelector("#breed-detail");
  const cacheStatusDisplay = document.querySelector("#cache-status");

  /* Try the cache first */
  const cached = readFromCache(breedId);

  if (cached) {
    cacheStatusDisplay.textContent = "Loaded from localStorage cache";
    cacheStatusDisplay.className = "cache-status from-cache";
    cacheStatusDisplay.hidden = false;
    renderBreedDetail(cached, detailContainer);
    return;
  }

  /* Cache miss — fetch from the API */
  detailContainer.textContent = "";
  const loadingMessage = document.createElement("p");
  loadingMessage.className = "loading";
  loadingMessage.textContent = "Fetching breed details...";
  detailContainer.appendChild(loadingMessage);
  cacheStatusDisplay.hidden = true;

  try {
    /*
     * Fetch a single breed by appending its UUID to the API URL.
     * The response has the same JSON:API structure but with a single
     * object in data instead of an array.
     */
    const response = await fetch(`${API_URL}/${breedId}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();
    const breedData = json.data;

    /* Save to cache for next time */
    writeToCache(breedId, breedData);

    cacheStatusDisplay.textContent = "Fetched from API (now cached)";
    cacheStatusDisplay.className = "cache-status";
    cacheStatusDisplay.hidden = false;

    renderBreedDetail(breedData, detailContainer);
  } catch (error) {
    detailContainer.textContent = "";
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = `Failed to fetch breed: ${error.message}`;
    detailContainer.appendChild(errorElement);
    cacheStatusDisplay.hidden = true;
  }
}

/**
 * Render a breed's full details into a container element.
 *
 * @param {object} breedData - A JSON:API breed resource object (has id, type, attributes)
 * @param {HTMLElement} container - The DOM element to render into
 */
function renderBreedDetail(breedData, container) {
  const { name, description, life, male_weight, female_weight, hypoallergenic } =
    breedData.attributes;

  container.textContent = "";

  const card = document.createElement("div");
  card.className = "card breed-card";

  const heading = document.createElement("p");
  heading.className = "breed-name";
  heading.textContent = name;

  const descriptionParagraph = document.createElement("p");
  descriptionParagraph.textContent = description;

  const meta = document.createElement("div");
  meta.className = "breed-meta";

  const lifespanSpan = document.createElement("span");
  lifespanSpan.textContent = `Lifespan: ${life.min}\u2013${life.max} years`;
  meta.appendChild(lifespanSpan);

  const maleWeightSpan = document.createElement("span");
  maleWeightSpan.textContent = `Male weight: ${male_weight.min}\u2013${male_weight.max} kg`;
  meta.appendChild(maleWeightSpan);

  const femaleWeightSpan = document.createElement("span");
  femaleWeightSpan.textContent = `Female weight: ${female_weight.min}\u2013${female_weight.max} kg`;
  meta.appendChild(femaleWeightSpan);

  if (hypoallergenic) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Hypoallergenic";
    meta.appendChild(badge);
  }

  card.append(heading, descriptionParagraph, meta);
  container.appendChild(card);
}

/*
 * ==========================================================================
 * localStorage cache with try/catch wrapper
 *
 * This is the key pattern from Station 3. Every interaction with
 * localStorage is wrapped in try/catch because:
 *
 * 1. localStorage might be full (throws QuotaExceededError)
 * 2. localStorage might be disabled (throws SecurityError in some browsers)
 * 3. The stored JSON might be corrupted (JSON.parse throws SyntaxError)
 * 4. The parsed data might have the wrong shape (our validation catches this)
 *
 * On any failure, we "self-heal" by removing the bad data and returning null.
 * The caller then falls back to a fresh fetch. The user never sees an error
 * from the cache — it either works or transparently falls back.
 *
 * DOCS CANDIDATE: defensive programming, self-healing cache, trust boundaries
 * ==========================================================================
 */

/**
 * Read a breed from the localStorage cache.
 * Returns the parsed breed data if valid, or null if missing/invalid/corrupted.
 *
 * @param {string} breedId - The UUID of the breed to look up
 * @returns {object|null} The cached breed data, or null on cache miss/error
 */
function readFromCache(breedId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + breedId);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    /*
     * Validate the shape of the cached data.
     * Even if JSON.parse succeeds, the data might not be what we expect.
     * Maybe a previous version of the app stored a different format,
     * or something else wrote to this key. We check for the minimum
     * properties we need before trusting it.
     */
    if (!parsed || !parsed.attributes || !parsed.attributes.name) {
      localStorage.removeItem(CACHE_KEY_PREFIX + breedId);
      return null;
    }

    return parsed;
  } catch {
    /*
     * Self-heal: if anything went wrong (corrupted JSON, localStorage error),
     * delete the bad data so it doesn't cause problems next time.
     * Return null so the caller falls back to a fresh fetch.
     */
    localStorage.removeItem(CACHE_KEY_PREFIX + breedId);
    return null;
  }
}

/**
 * Write a breed to the localStorage cache.
 * Fails silently if localStorage is full or unavailable.
 *
 * @param {string} breedId - The UUID of the breed to cache
 * @param {object} data - The breed data to store
 */
function writeToCache(breedId, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + breedId, JSON.stringify(data));
  } catch {
    /* Storage full or unavailable — fail silently, the app still works */
  }
}

/**
 * Clear all cached breeds from localStorage.
 * Only removes keys with our prefix — other localStorage data is untouched.
 */
function clearCache() {
  const keysToRemove = [];

  /*
   * localStorage doesn't have a "find all keys starting with X" method,
   * so we iterate through all keys and collect the ones that match our prefix.
   * We collect first, then remove — modifying localStorage while iterating
   * over it can skip keys because the indices shift.
   *
   * DOCS CANDIDATE: iterating localStorage safely, why collect-then-remove
   */
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }

  /* Reset the UI to its initial state — clear the displayed breed,
   * the search input, and update the cache status message. */
  const detailContainer = document.querySelector("#breed-detail");
  detailContainer.textContent = "";
  const resetMessage = document.createElement("p");
  resetMessage.className = "loading";
  resetMessage.textContent = "Search for a breed above...";
  detailContainer.appendChild(resetMessage);

  const searchInput = document.querySelector("#breed-search");
  searchInput.value = "";

  const cacheStatusDisplay = document.querySelector("#cache-status");
  cacheStatusDisplay.textContent = `Cache cleared (${keysToRemove.length} items removed)`;
  cacheStatusDisplay.className = "cache-status";
  cacheStatusDisplay.hidden = false;
}
