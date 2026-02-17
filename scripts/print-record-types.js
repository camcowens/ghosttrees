/**
 * @fileoverview Extracts and prints unique record types from a GeoJSON FeatureCollection.
 * 
 * @description
 * This script reads a GeoJSON file (defaulting to public/data.geojson) and extracts
 * all unique Record_Type values from the features. It then prints each unique record
 * type to stdout, one per line.
 * 
 * @usage
 * node scripts/print-record-types.js [path/to/data.geojson]
 * 
 * @example
 * // Using default file (public/data.geojson)
 * node scripts/print-record-types.js
 * 
 * // Using custom file path
 * node scripts/print-record-types.js dist/data.geojson
 * 
 * @example
 * // Example output:
 * Arborist_Complaint
 * Arborist_Illegal_Activity
 * ...
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Extracts the Record_Type property from a GeoJSON feature.
 * 
 * @param {Object} feature - A GeoJSON feature object
 * @param {Object} [feature.properties] - The properties object of the feature
 * @param {string} [feature.properties.Record_Type] - The record type value
 * @returns {string|undefined} The Record_Type value, or undefined if not present
 * 
 * @example
 * const feature = {
 *   properties: { Record_Type: "Arborist_Complaint" }
 * };
 * getRecordTypeFromFeature(feature); // Returns "Arborist_Complaint"
 */
function getRecordTypeFromFeature(feature) {
  return feature?.properties?.Record_Type;
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

const unique = new Set();

for (const feature of features) {
  const recordType = getRecordTypeFromFeature(feature);
  if (recordType) unique.add(recordType);
}

for (const t of unique) {
  console.log(t);
}