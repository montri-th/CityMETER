/** A resource without an approved preview remains a valid public catalog resource. */
export function validatePreviewContract(records, previews) {
  const expected = records.filter(
    (record) => record.previewAvailable !== false,
  );
  const expectedIds = new Set(expected.map((record) => record.id));
  const previewIds = new Set(previews.map((preview) => preview.id));
  const missing = expected.filter((record) => !previewIds.has(record.id));
  const extra = previews.filter((preview) => !expectedIds.has(preview.id));
  if (
    previews.length !== expected.length ||
    previewIds.size !== previews.length ||
    missing.length ||
    extra.length
  ) {
    throw new Error(
      `CityMETER preview config mismatch: expected=${expected.length}, previews=${previews.length}, unique=${previewIds.size}, missing=${missing.map((r) => r.id).join(",") || "none"}, extra=${extra.map((r) => r.id).join(",") || "none"}`,
    );
  }
}
