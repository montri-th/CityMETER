import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const routes = new Map(Object.entries({
  "dataset-buildings": "https://landometer.com/v3/citymeter-3d/BKK/L/8b60964e-0c26-408e-95f6-e3f46fe37d46?d=building",
  "dataset-registered-housing-estates": "https://landometer.com/v3/citymeter?d=estate",
  "dataset-eia-projects": "https://landometer.com/v3/citymeter?d=eiaReport",
  "dataset-crop-area-output": "https://landometer.com/v3/citymeter/PRE?d=muenRai",
  "dataset-land-appraisal": "https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed",
  "dataset-land-listing-prices": "https://landometer.com/v3/citymeter?d=landoffer",
  "dataset-apartment-rent": "https://landometer.com/v3/citymeter/BKK?d=apartment",
  "dataset-condo-appraisal": "https://landometer.com/v3/citymeter?d=condo",
  "dataset-condo-listing-prices": "https://landometer.com/v3/citymeter/BKK?d=condoOffer",
  "dataset-detached-listing-prices": "https://landometer.com/v3/citymeter?d=detachedhouse",
  "dataset-townhouse-listing-prices": "https://landometer.com/v3/citymeter/BKK?d=townhouse",
  "dataset-condo-rent-yield": "https://landometer.com/v3/citymeter/BKK?d=rentWise",
  "dataset-registered-companies-status-capital": "https://landometer.com/v3/citymeter/BKK?d=company",
  "dataset-business-dynamics": "https://landometer.com/v3/citymeter?d=businessDynamics",
  "dataset-factories-workers-investment": "https://landometer.com/v3/citymeter?d=factory",
  "dataset-office-buildings-rent": "https://landometer.com/v3/citymeter/BKK?d=office",
  "dataset-restaurants": "https://landometer.com/v3/citymeter/BKK?d=restaurant",
  "dataset-shopping-centers": "https://landometer.com/v3/citymeter?d=shoppingCenter",
  "dataset-hotel-market": "https://landometer.com/v3/citymeter?d=hotel",
  "dataset-tourism-demand-spending": "https://landometer.com/v3/citymeter?d=tourism",
  "dataset-fuel-stations": "https://landometer.com/v3/citymeter?d=gasStation",
  "dataset-registered-cars": "https://landometer.com/v3/citymeter?d=cars",
  "dataset-road-network-archetypes": "https://landometer.com/v3/citymeter/BKK?d=roadDna",
  "dataset-traffic-congestion-speed": "https://landometer.com/v3/citymeter/BKK?d=traffic",
  "dataset-locale-insights": "https://landometer.com/v3/citymeter/BKK?d=localeInsights",
  "dataset-population-age-sex": "https://landometer.com/v3/citymeter?d=population",
  "dataset-schools-students-teachers": "https://landometer.com/v3/citymeter?d=school",
  "dataset-municipal-revenue": "https://landometer.com/v3/citymeter?d=municipality",
  "dataset-government-agencies-workforce": "https://landometer.com/v3/citymeter?d=governmentOfficer",
  "dataset-flood-recurrent": "https://landometer.com/v3/citymeter/AYA/D/1408?d=floodimpact",
  "dataset-flood-latest-observed": "https://landometer.com/v3/citymeter?d=floodrecent",
  "dataset-flood-forecast-depth": "https://landometer.com/v3/citymeter/BKK?d=flood-forecast-depth",
  "dataset-flood-forecast-flash-flood-risk": "https://landometer.com/v3/citymeter?d=flash-flood-risk",
  "dataset-earthquake-sensors": "https://landometer.com/v3/citymeter?d=quake",
  "dataset-fire-monitoring": "https://landometer.com/v3/citymeter?d=fire",
  "dataset-disaster-historical-impacts": "https://landometer.com/v3/citymeter?d=disaster",
  "dataset-events-hat-yai-flood-2025-11": "https://landometer.com/v3/citymeter/SKA/D/9011?d=hatyaiflood",
  "dataset-events-quake-building-inspection": "https://landometer.com/v3/citymeter/BKK?d=quakeSafe"
}));

if (routes.size !== 38) throw new Error(`Expected 38 route records; found ${routes.size}`);

function updateRegistry() {
  const path = join(root, "data/catalog-source-review.json");
  let source = readFileSync(path, "utf8");

  for (const [id, url] of routes) {
    const pattern = new RegExp(`(      "id": "${id}",\\n)(?:      "citymeterUrl": "[^"]+",\\n)?`);
    if (!pattern.test(source)) throw new Error(`Registry record not found: ${id}`);
    source = source.replace(pattern, `$1      "citymeterUrl": "${url}",\n`);
  }

  writeFileSync(path, source);
}

function updateJsonLd(html, page) {
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const match = html.match(pattern);
  if (!match) throw new Error(`JSON-LD block not found in ${page}`);
  const json = JSON.parse(match[1]);
  const catalog = json["@graph"]?.find((entry) => entry["@type"] === "DataCatalog");
  if (!catalog || !Array.isArray(catalog.dataset) || catalog.dataset.length !== 38) {
    throw new Error(`Expected 38 JSON-LD datasets in ${page}`);
  }

  for (const dataset of catalog.dataset) {
    const id = dataset["@id"]?.split("#").at(-1);
    const route = routes.get(id);
    if (!route) throw new Error(`No route for JSON-LD record ${id} in ${page}`);
    dataset.subjectOf.url = route;
  }

  return html.replace(pattern, `<script type="application/ld+json">${JSON.stringify(json)}</script>`);
}

function updatePage(page) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  html = html
    .replace("ก่อนตัดสินใจเรื่องพื้นที่\nดูให้เห็นมากกว่าจุดบนแผนที่", "CityMETER")
    .replace("Before you decide on a place,\nsee more than pins on a map", "CityMETER")
    .replaceAll("catalog-enhancements.css?v=5", "catalog-enhancements.css?v=6")
    .replaceAll("catalog-enhancements.js?v=8", "catalog-enhancements.js?v=9")
    .replaceAll("index-qbT50gkr-v3.js?v=2", "index-qbT50gkr-v3.js?v=3");

  for (const route of routes.values()) {
    const datasetKey = new URL(route).searchParams.get("d");
    const genericRoute = `https://landometer.com/v3/citymeter?d=${datasetKey}`;
    if (genericRoute !== route) html = html.replaceAll(genericRoute, route);
  }

  for (const [id, route] of routes) {
    const start = html.indexOf(`<article class="dataset-card" id="${id}"`);
    const end = html.indexOf("</article>", start) + "</article>".length;
    if (start < 0 || end < "</article>".length) throw new Error(`Card not found in ${page}: ${id}`);
    const card = html.slice(start, end);
    let replacements = 0;
    const updated = card.replace(/(<a class="dataset-(?:image|open)" href=")[^"]+("[^>]*>)/g, (_match, before, after) => {
      replacements += 1;
      return `${before}${route}${after}`;
    });
    if (replacements !== 2) throw new Error(`Expected two primary links for ${id} in ${page}; found ${replacements}`);
    html = html.slice(0, start) + updated + html.slice(end);
  }

  html = updateJsonLd(html, page);
  writeFileSync(path, html);
}

function updateHydratedBundle() {
  const path = join(root, "assets/index-qbT50gkr-v3.js");
  let source = readFileSync(path, "utf8");
  const replacements = [
    [`ก่อนตัดสินใจเรื่องพื้นที่
ดูให้เห็นมากกว่าจุดบนแผนที่`, "CityMETER"],
    [`Before you decide on a place,
see more than pins on a map`, "CityMETER"]
  ];
  for (const [from, to] of replacements) {
    if (source.includes(from)) source = source.replace(from, to);
  }

  for (const [datasetId, route] of routes) {
    const bundleId = datasetId.replace(/^dataset-events-/, "events/").replace(/^dataset-/, "");
    const marker = `id:"${bundleId}",`;
    const recordStart = source.indexOf(marker);
    if (recordStart < 0) throw new Error(`Hydrated dataset not found: ${datasetId}`);
    const nextRecord = source.indexOf("},{id:", recordStart);
    const hrefStart = source.indexOf("href:", recordStart);
    if (hrefStart < 0 || (nextRecord >= 0 && hrefStart > nextRecord)) {
      throw new Error(`Hydrated href not found: ${datasetId}`);
    }
    const hrefMatch = source.slice(hrefStart).match(/^href:(?:me\("[^"]+"(?:,!0)?\)|"https:\/\/landometer\.com\/v3\/citymeter[^"]*")/);
    if (!hrefMatch) throw new Error(`Unsupported hydrated href for ${datasetId}`);
    source = `${source.slice(0, hrefStart)}href:${JSON.stringify(route)}${source.slice(hrefStart + hrefMatch[0].length)}`;
  }
  writeFileSync(path, source);
}

updateRegistry();
updatePage("index.html");
updatePage("en/index.html");
updateHydratedBundle();

console.log("Applied CityMETER headline, 38 canonical card routes, JSON-LD routes and cache revisions.");
