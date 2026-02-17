/**
 * @fileoverview Analyzes address-to-feature relationships in a GeoJSON FeatureCollection.
 * 
 * @description
 * This script reads a GeoJSON file (defaulting to public/data.geojson) and analyzes
 * how many features are associated with each address. It then groups addresses by
 * the number of features they have and prints statistics showing how many addresses
 * have 1 feature, 2 features, 3 features, etc.
 * 
 * @usage
 * node scripts/print-address-feature-counts.js [path/to/data.geojson]
 * 
 * @example
 * // Using default file (public/data.geojson)
 * node scripts/print-address-feature-counts.js
 * 
 * // Using custom file path
 * node scripts/print-address-feature-counts.js dist/data.geojson
 * 
 * @example
 * // Example output:
 * 1 features: 5666 addresses
 * 2 features: 1332 addresses
 * 3 features: 329 addresses
 * ...
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Extracts the Address property from a GeoJSON feature.
 * 
 * @param {Object} feature - A GeoJSON feature object
 * @param {Object} [feature.properties] - The properties object of the feature
 * @param {string} [feature.properties.Address] - The address value
 * @returns {string|undefined} The Address value, or undefined if not present
 * 
 * @example
 * const feature = {
 *   properties: { Address: "1429 ATHENS AVE SW, ATLANTA GA 30310" }
 * };
 * getAddressFromFeature(feature); // Returns "1429 ATHENS AVE SW, ATLANTA GA 30310"
 */
function getAddressFromFeature(feature) {
  return feature?.properties?.Address;
}

const inputPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(process.cwd(), "public", "data.geojson");

let geojsonText;
try {
  geojsonText = await fs.readFile(inputPath, "utf8");
} catch (err) {
  console.error(`Failed to read file: ${inputPath}`);
  console.error(err?.message ?? err);
  process.exit(1);
}

let geojson;
try {
  geojson = JSON.parse(geojsonText);
} catch (err) {
  console.error(`Failed to parse JSON from: ${inputPath}`);
  console.error(err?.message ?? err);
  process.exit(1);
}

const features = Array.isArray(geojson?.features) ? geojson.features : null;

if (!features) {
  console.error("Expected a GeoJSON FeatureCollection with a 'features' array.");
  process.exit(1);
}

const addressFeatureCounts = new Map();

for (const feature of features) {
  const address = getAddressFromFeature(feature);
  if (address) {
    addressFeatureCounts.set(
      address,
      (addressFeatureCounts.get(address) || 0) + 1
    );
  }
}

const featureCountGroups = new Map();

for (const count of addressFeatureCounts.values()) {
  featureCountGroups.set(
    count,
    (featureCountGroups.get(count) || 0) + 1
  );
}

const sortedCounts = Array.from(featureCountGroups.entries()).sort(
  (a, b) => a[0] - b[0]
);

for (const [featureCount, addressCount] of sortedCounts) {
  console.log(`${featureCount} features: ${addressCount} addresses`);
}
