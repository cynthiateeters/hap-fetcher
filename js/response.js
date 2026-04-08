/*
 * response.js — Station 2: Response Explorer
 * Shows the raw JSON:API response from the Dog API
 * and demonstrates how to extract useful data from it.
 *
 * The key lesson here: APIs rarely return data in the shape your UI needs.
 * You have to understand the response structure and pull out what matters.
 */

const API_URL = "https://dogapi.dog/api/v2/breeds";

/**
 * Initialize the Response Explorer view.
 * Attaches the click handler to the fetch button.
 * Called once by app.js when the user first navigates to this view.
 */
export function initExplorer() {
  const fetchButton = document.querySelector("#fetch-btn");
  fetchButton.addEventListener("click", fetchAndDisplay);
}

/**
 * Fetch breeds from the Dog API, then display both the raw response
 * and the extracted breed data side by side.
 *
 * This function demonstrates two things:
 * 1. What a JSON:API response actually looks like (the raw view)
 * 2. How to dig into that structure to get the data you need (the extracted view)
 */
async function fetchAndDisplay() {
  const rawDisplay = document.querySelector("#raw-response");
  const extractedDisplay = document.querySelector("#extracted-data");

  /* Show loading state in both areas while we wait */
  rawDisplay.textContent = "Fetching...";
  extractedDisplay.textContent = "";
  const loadingMessage = document.createElement("p");
  loadingMessage.className = "loading";
  loadingMessage.textContent = "Fetching...";
  extractedDisplay.appendChild(loadingMessage);

  try {
    /*
     * Fetch 3 breeds — enough to see the full structure without
     * overwhelming the display. The JSON:API format includes pagination
     * metadata (meta), navigation links (links), and relationship
     * references (relationships) for every response, even a small one.
     */
    const response = await fetch(`${API_URL}?page[number]=1&page[size]=3`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();

    /*
     * --- Raw response display ---
     * Show the entire JSON response with syntax coloring and annotations.
     * This helps students see the full structure they're working with.
     */
    rawDisplay.textContent = "";
    buildAnnotatedJson(json, rawDisplay);

    /*
     * --- Extracted data display ---
     * Now show what we actually need from this response.
     * The path to useful data is: json.data[].attributes
     *
     * The JSON:API format wraps everything in layers:
     *   json              → the full response
     *   json.data         → array of resource objects
     *   json.data[0]      → one breed (has id, type, attributes, relationships)
     *   json.data[0].attributes → the actual breed info (name, description, etc.)
     *
     * DOCS CANDIDATE: navigating nested API responses, the "path to data" concept
     */
    extractedDisplay.textContent = "";

    for (const breed of json.data) {
      const { name, description, life, male_weight, hypoallergenic } = breed.attributes;

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
      lifespanSpan.textContent = `Lifespan: ${life.min}\u2013${life.max} yrs`;
      meta.appendChild(lifespanSpan);

      const weightSpan = document.createElement("span");
      weightSpan.textContent = `Weight: ${male_weight.min}\u2013${male_weight.max} kg`;
      meta.appendChild(weightSpan);

      if (hypoallergenic) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Hypoallergenic";
        meta.appendChild(badge);
      }

      card.append(heading, descriptionParagraph, meta);
      extractedDisplay.appendChild(card);
    }
  } catch (error) {
    rawDisplay.textContent = `Error: ${error.message}`;
    extractedDisplay.textContent = "";
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = `Failed to fetch: ${error.message}`;
    extractedDisplay.appendChild(errorElement);
  }
}

/*
 * ==========================================================================
 * JSON display helpers
 *
 * Everything below builds a syntax-highlighted, annotated view of the
 * raw JSON response using only DOM methods (no innerHTML).
 *
 * The approach:
 * 1. JSON.stringify the response with indentation
 * 2. Split into lines
 * 3. Tokenize each line (keys, strings, numbers, booleans, punctuation)
 * 4. Wrap each token in a <span> with a CSS class for coloring
 * 5. Add annotations to key structural lines
 * ==========================================================================
 */

/**
 * Build an annotated, syntax-highlighted JSON display inside a container element.
 *
 * @param {object} json - The parsed JSON response to display
 * @param {HTMLElement} container - The DOM element to render into
 */
function buildAnnotatedJson(json, container) {
  /*
   * These annotations appear next to key structural elements in the JSON.
   * They help students understand what each top-level key means
   * in the JSON:API format.
   */
  const annotations = {
    '"data"': "\u2190 array of breed objects",
    '"attributes"': "\u2190 the useful stuff lives here",
    '"meta"': "\u2190 pagination info",
    '"links"': "\u2190 navigation URLs",
    '"relationships"': "\u2190 related resources",
    '"pagination"': "\u2190 page numbers and total records",
  };

  const lines = JSON.stringify(json, null, 2).split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const lineSpan = document.createElement("span");
    colorizeJsonLine(line, lineSpan);

    /* Add an inline annotation if this line contains a key structural element */
    for (const [key, note] of Object.entries(annotations)) {
      if (line.includes(key)) {
        const annotation = document.createElement("span");
        annotation.className = "json-annotation";
        annotation.textContent = `  ${note}`;
        lineSpan.appendChild(annotation);
        break;
      }
    }

    container.appendChild(lineSpan);

    if (index < lines.length - 1) {
      container.appendChild(document.createTextNode("\n"));
    }
  }
}

/**
 * Colorize a single line of JSON by splitting it into typed tokens
 * and wrapping each in a styled <span>.
 *
 * @param {string} line - One line of formatted JSON text
 * @param {HTMLElement} container - The <span> element to append tokens to
 */
function colorizeJsonLine(line, container) {
  const tokens = tokenizeLine(line);

  for (const token of tokens) {
    const tokenSpan = document.createElement("span");
    tokenSpan.textContent = token.text;
    if (token.className) {
      tokenSpan.className = token.className;
    }
    container.appendChild(tokenSpan);
  }
}

/**
 * Split a single JSON line into tokens with type information.
 * Each token has a text property and an optional className for styling.
 *
 * This is a simple tokenizer — not a full JSON parser. It handles the
 * common cases: strings (keys and values), numbers, booleans, null,
 * whitespace, and punctuation.
 *
 * @param {string} line - One line of formatted JSON text
 * @returns {Array<{text: string, className?: string}>} Array of tokens
 */
function tokenizeLine(line) {
  const tokens = [];
  let position = 0;

  while (position < line.length) {
    /* Whitespace — preserve indentation */
    if (line[position] === " ") {
      const start = position;
      while (position < line.length && line[position] === " ") position++;
      tokens.push({ text: line.slice(start, position) });
      continue;
    }

    /*
     * Strings — could be a key (followed by :) or a value.
     * We read until the closing quote, handling escaped characters.
     */
    if (line[position] === '"') {
      const start = position;
      position++;
      while (position < line.length && line[position] !== '"') {
        if (line[position] === "\\") position++; /* skip escaped characters */
        position++;
      }
      position++; /* closing quote */

      const stringText = line.slice(start, position);
      const rest = line.slice(position);

      /* If followed by a colon, this string is an object key */
      if (rest.startsWith(":")) {
        tokens.push({ text: stringText, className: "json-key" });
      } else {
        tokens.push({ text: stringText, className: "json-string" });
      }
      continue;
    }

    /* Numbers — digits, optionally negative, optionally decimal */
    if (line[position] === "-" || (line[position] >= "0" && line[position] <= "9")) {
      const start = position;
      if (line[position] === "-") position++;
      while (position < line.length && line[position] >= "0" && line[position] <= "9") position++;
      if (position < line.length && line[position] === ".") {
        position++;
        while (position < line.length && line[position] >= "0" && line[position] <= "9") position++;
      }
      tokens.push({ text: line.slice(start, position), className: "json-number" });
      continue;
    }

    /* Booleans and null */
    if (line.slice(position).startsWith("true")) {
      tokens.push({ text: "true", className: "json-boolean" });
      position += 4;
      continue;
    }
    if (line.slice(position).startsWith("false")) {
      tokens.push({ text: "false", className: "json-boolean" });
      position += 5;
      continue;
    }
    if (line.slice(position).startsWith("null")) {
      tokens.push({ text: "null", className: "json-boolean" });
      position += 4;
      continue;
    }

    /* Punctuation — braces, brackets, colons, commas */
    tokens.push({ text: line[position] });
    position++;
  }

  return tokens;
}
