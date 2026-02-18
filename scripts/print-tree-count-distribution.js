/**
 * @fileoverview Analyzes Num_of_Trees distribution in a GeoJSON FeatureCollection.
 *
 * @description
 * This script reads a GeoJSON file (defaulting to public/data.geojson) and
 * analyzes how many records have 0 trees, 1 tree, 2 trees, 3 trees, and so on
 * based on the `Num_of_Trees` property on each feature. It then prints
 * statistics showing how many records fall into each Num_of_Trees bucket.
 *
 * All finite numeric values are included, including 0 and negative values,
 * to help with data validation.
 *
 * @usage
 * node scripts/print-tree-count-distribution.js [path/to/data.geojson]
 *
 * @example
 * // Using default file (public/data.geojson)
 * node scripts/print-tree-count-distribution.js
 *
 * // Using custom file path
 * node scripts/print-tree-count-distribution.js dist/data.geojson
 *
 * @example
 * // Example output:
 * -1 trees: 2 records
 * 0 trees: 5 records
 * 1 tree: 12000 records
 * 2 trees: 2000 records
 * 3 trees: 500 records
 * ...
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Extracts the Num_of_Trees property from a GeoJSON feature as a number.
 *
 * @param {Object} feature - A GeoJSON feature object
 * @param {Object} [feature.properties] - The properties object of the feature
 * @param {string|number} [feature.properties.Num_of_Trees] - The Num_of_Trees value
 * @returns {number|undefined} The numeric Num_of_Trees value, or undefined if not a finite number
 *
 * @example
 * const feature = {
 *   properties: { Num_of_Trees: "3" }
 * };
 * getTreeCountFromFeature(feature); // Returns 3
 */
function getTreeCountFromFeature(feature) {
  const raw = feature?.properties?.Num_of_Trees;

  if (raw === null || raw === undefined) {
    return undefined;
  }

  const num = Number(raw);

  if (!Number.isFinite(num)) {
    return undefined;
  }

  return num;
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

const treeCountGroups = new Map();

for (const feature of features) {
  const treeCount = getTreeCountFromFeature(feature);

  if (treeCount === undefined) {
    continue;
  }

  treeCountGroups.set(
    treeCount,
    (treeCountGroups.get(treeCount) || 0) + 1
  );
}

const sortedCounts = Array.from(treeCountGroups.entries()).sort(
  (a, b) => a[0] - b[0]
);

for (const [numTrees, recordCount] of sortedCounts) {
  const treeLabel = Math.abs(numTrees) === 1 ? "tree" : "trees";
  const recordLabel = recordCount === 1 ? "record" : "records";

  console.log(`${numTrees} ${treeLabel}: ${recordCount} ${recordLabel}`);
}

