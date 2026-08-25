export const CONTRIBUTOR_VISIBLE_LIMIT = 3;

export const CONTRIBUTOR_PROJECTION_SUMMARY_KEYS = Object.freeze([
  "assignments",
  "datasetRecords",
  "eventRecords",
  "expandedRecords",
  "fallbackIdentities",
  "portraitIdentities",
  "portraitRenditions",
  "records",
  "uniquePeople",
  "visibleLimit"
]);

export function deriveContributorProjectionSummary(registry) {
  const records = Array.isArray(registry?.records) ? registry.records : [];
  const people = new Map();
  let assignments = 0;
  let datasetRecords = 0;
  let eventRecords = 0;
  let expandedRecords = 0;

  for (const record of records) {
    const contributors = Array.isArray(record?.contributors) ? record.contributors : [];
    assignments += contributors.length;
    if (record?.resourceClass === "event") eventRecords += 1;
    else datasetRecords += 1;
    if (contributors.length > CONTRIBUTOR_VISIBLE_LIMIT) expandedRecords += 1;
    for (const contributor of contributors) {
      if (!people.has(contributor.personId)) people.set(contributor.personId, contributor.portrait?.kind);
    }
  }

  const portraitIdentities = [...people.values()].filter((kind) => kind === "portrait").length;
  const fallbackIdentities = [...people.values()].filter((kind) => kind === "neutral_fallback").length;
  return {
    assignments,
    datasetRecords,
    eventRecords,
    expandedRecords,
    fallbackIdentities,
    portraitIdentities,
    portraitRenditions: portraitIdentities * 2,
    records: records.length,
    uniquePeople: people.size,
    visibleLimit: CONTRIBUTOR_VISIBLE_LIMIT
  };
}

export function assertProjectionSummary(assert, actual, expected, label = "Contributor projection summary") {
  for (const key of CONTRIBUTOR_PROJECTION_SUMMARY_KEYS) {
    assert(Number.isInteger(actual?.[key]) && actual[key] >= 0, `${label}.${key} must be a non-negative integer`);
    assert(actual[key] === expected[key], `${label}.${key} drifted; expected ${expected[key]}, received ${actual[key]}`);
  }
}
