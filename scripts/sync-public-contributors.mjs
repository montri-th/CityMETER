import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const url =
  "https://montri-th.github.io/Landom/data/generated/citymeter-contributors.json";
const fileIndex = process.argv.indexOf("--file");
const content =
  fileIndex >= 0
    ? readFileSync(process.argv[fileIndex + 1], "utf8")
    : await fetch(url, { signal: AbortSignal.timeout(20000) }).then(
        async (response) => {
          if (!response.ok)
            throw Error(`Public Landom projection returned ${response.status}`);
          return response.text();
        },
      );
const projection = JSON.parse(content);
if (
  projection.schemaVersion !== "1.0.0" ||
  projection.canonicalUrl !== url ||
  !projection.byModuleSlug
)
  throw Error("Unrecognized public contributor projection");
for (const [module, people] of Object.entries(projection.byModuleSlug)) {
  if (!module.startsWith("dataset-") || !Array.isArray(people))
    throw Error("Invalid public module entry");
  for (const person of people) {
    if (!person.personId || !person.nickname || !person.profileUrl)
      throw Error("Incomplete public person entry");
    for (const lang of ["th", "en"]) {
      const profile = new URL(person.profileUrl[lang]);
      if (
        profile.origin !== "https://montri-th.github.io" ||
        !profile.pathname.startsWith("/Landom/")
      )
        throw Error("Profile URL is not public Landom");
    }
  }
}
writeFileSync(
  fileURLToPath(new URL("../data/landom-contributors.json", import.meta.url)),
  content,
);
console.log(
  `Synchronized ${Object.keys(projection.byModuleSlug).length} public Landom module credits. Run the catalog build and review attribution changes.`,
);
