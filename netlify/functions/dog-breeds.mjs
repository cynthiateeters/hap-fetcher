/*
 * dog-breeds.mjs — Serverless proxy for Dog API breeds endpoint
 *
 * This function replaces the simpler dog-facts proxy from Station 4.
 * It does more than just forward the request — it transforms the response
 * by converting weight from kilograms to pounds.
 *
 * Why transform on the server?
 * The Dog API returns weight in kg, but the local shelter where HAP
 * found Fetcher lists dogs in pounds. Instead of converting in the browser
 * (where the logic would be visible and duplicated), we convert once
 * on the server and send clean, ready-to-display data to the client.
 *
 * This demonstrates a real reason for a proxy beyond just hiding URLs:
 * the server can reshape data before the client ever sees it.
 */

const KG_TO_LBS = 2.20462;

/**
 * Convert a weight object from kg to lbs.
 * Rounds to one decimal place for readability.
 *
 * @param {{ min: number, max: number }} weight - Weight range in kg
 * @returns {{ min: number, max: number }} Weight range in lbs
 */
function convertWeightToLbs(weight) {
  return {
    min: Math.round(weight.min * KG_TO_LBS * 10) / 10,
    max: Math.round(weight.max * KG_TO_LBS * 10) / 10,
  };
}

/**
 * Handle incoming requests to /.netlify/functions/dog-breeds
 *
 * Supports two URL patterns:
 *   /.netlify/functions/dog-breeds          → paginated breed list
 *   /.netlify/functions/dog-breeds?id=UUID  → single breed by ID
 *
 * All weight values in the response are converted from kg to lbs.
 *
 * @param {Request} request - The incoming request object
 * @returns {Response} JSON response with breed data (weights in lbs)
 */
export default async function handler(request) {
  const baseUrl = process.env.DOG_API_BASE_URL || "https://dogapi.dog/api/v2";

  /*
   * Parse the request URL to check for query parameters.
   * new URL() needs a full URL, so we combine the request's relative URL
   * with a base. The base doesn't matter — we only read the search params.
   */
  const url = new URL(request.url, "http://localhost");
  const breedId = url.searchParams.get("id");

  try {
    /*
     * Build the upstream URL based on whether we're fetching one breed or a list.
     * If an id parameter is provided, fetch that specific breed.
     * Otherwise, fetch the first page of 20 breeds.
     */
    let apiUrl;
    if (breedId) {
      apiUrl = `${baseUrl}/breeds/${breedId}`;
    } else {
      const page = url.searchParams.get("page") || "1";
      const size = url.searchParams.get("size") || "20";
      apiUrl = `${baseUrl}/breeds?page[number]=${page}&page[size]=${size}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Dog API responded with ${response.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    /*
     * Transform the response: convert all weight values from kg to lbs.
     *
     * The JSON:API response can have either:
     *   - data as an array (breed list) → transform each item
     *   - data as a single object (breed detail) → transform just that one
     *
     * We also add a "units" field to make it clear the weights are in lbs,
     * not the original kg. This prevents confusion downstream.
     */
    if (Array.isArray(data.data)) {
      for (const breed of data.data) {
        breed.attributes.male_weight = convertWeightToLbs(breed.attributes.male_weight);
        breed.attributes.female_weight = convertWeightToLbs(breed.attributes.female_weight);
        breed.attributes.weight_unit = "lbs";
      }
    } else if (data.data && data.data.attributes) {
      data.data.attributes.male_weight = convertWeightToLbs(data.data.attributes.male_weight);
      data.data.attributes.female_weight = convertWeightToLbs(data.data.attributes.female_weight);
      data.data.attributes.weight_unit = "lbs";
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to reach Dog API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
