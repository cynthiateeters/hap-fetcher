/*
 * dog-facts.mjs — Serverless proxy for Dog API facts endpoint
 *
 * This Netlify function sits between the browser and the Dog API.
 * Instead of the browser calling the Dog API directly, it calls
 * this function at /.netlify/functions/dog-facts, and this function
 * calls the Dog API on the server.
 *
 * Why use a proxy?
 * - API keys and base URLs stay on the server, not in browser code
 * - The server can transform, filter, or cache responses before sending them
 * - The browser only talks to your own domain, reducing CORS issues
 *
 * The .mjs extension tells Node.js this file uses ES modules (import/export).
 * Netlify functions support ESM natively with .mjs — no bundler needed.
 *
 * DOCS CANDIDATE: why serverless functions, what .mjs means, CORS
 */

/**
 * Handle incoming requests to /.netlify/functions/dog-facts
 *
 * Netlify functions export a default async function that receives
 * a Request object and returns a Response object — the same Web API
 * standards that the browser uses for fetch().
 *
 * @returns {Response} JSON response with dog facts or an error message
 */
export default async function handler() {
  /*
   * Read the API base URL from an environment variable.
   * In development, this comes from the .env file.
   * In production, it comes from Netlify's environment variable UI.
   *
   * The || fallback provides a default so the function works even
   * if the environment variable isn't set.
   *
   * DOCS CANDIDATE: process.env, .env files, Netlify environment variables
   */
  const baseUrl = process.env.DOG_API_BASE_URL || "https://dogapi.dog/api/v2";

  try {
    /*
     * This fetch runs on the SERVER, not in the browser.
     * The browser never sees this URL or any API keys.
     * Node 18+ has native fetch — no packages needed.
     */
    const response = await fetch(`${baseUrl}/facts?limit=1`);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Dog API responded with ${response.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    /*
     * 502 Bad Gateway means "I tried to reach the upstream server
     * but couldn't." This is the appropriate status when our proxy
     * can't reach the Dog API.
     */
    return new Response(
      JSON.stringify({ error: "Failed to reach Dog API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

/*
 * The function URL is derived automatically from the filename:
 * dog-facts.mjs → /.netlify/functions/dog-facts
 * No config export needed for regular Netlify functions.
 */
