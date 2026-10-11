import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Individually reviewed audience-facing facts, not inferred source metadata.
// null means a neutral link to the full native source disclosure. The original
// catalog remains the factual source and is rendered there without shortening.
export const articleFactProjection = JSON.parse(readFileSync(new URL('./article-facts.json', import.meta.url), 'utf8'));
export function conciseArticleFacts(record, lang) {
  const facts = articleFactProjection[record.datasetCode];
  if (!facts) throw new Error(`Article facts need review: ${record.datasetCode}`);
  const digest = createHash('sha256').update(JSON.stringify({sourceReview:record.sourceReview,scope:record.scope,granularity:record.granularity})).digest('hex');
  if (digest !== facts.sourceSha256) throw new Error(`Source facts changed; review concise article facts: ${record.datasetCode}`);
  return ['period','scope','grain','publisher'].map(key => facts[key]?.[lang] || '');
}
