import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const ids = review.records.map((record) => record.id);
const muenRaiRoute = "https://landometer.com/v3/citymeter/PRE?d=muenRai";
const oldMuenRaiRoute = "https://landometer.com/v3/citymeter?d=muenRai";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

assert(review.reviewedAt === "2026-08-14", "Unexpected review date");
assert(ids.length === 38 && new Set(ids).size === 38, "Source registry must contain 38 unique records");
assert(review.records.filter((record) => record.status === "verified-lineage").length === 11, "Expected 11 verified-lineage records");
assert(review.records.filter((record) => record.conceptualPreview).length === 3, "Expected three labelled conceptual previews");
assert(
  review.records.find((record) => record.id === "dataset-crop-area-output")?.citymeterUrl === muenRaiRoute,
  "Muen Rai registry record must use the direct Phrae route"
);

for (const page of ["index.html", "en/index.html"]) {
  const html = readFileSync(join(root, page), "utf8");
  assert((html.match(/class="dataset-card"/g) || []).length === 38, `${page} must prerender 38 cards`);
  assert(html.includes("catalog-enhancements.css") && html.includes("catalog-enhancements.js"), `${page} is missing the enhancement layer`);
  assert(html.includes("catalog-enhancements.css?v=5"), `${page} must load the motion cache-busted stylesheet`);
  assert(html.includes("catalog-enhancements.js?v=8"), `${page} must load the direct-route enhancement layer`);
  assert(html.includes("index-qbT50gkr-v3.js?v=2"), `${page} must load the permanent-handoff bundle revision`);
  assert(html.includes('name="citymeter:catalog-version" content="2026-08-14"'), `${page} has a stale catalog version`);
  assert(html.includes("media/social/citymeter-share-2026-08-14.jpg"), `${page} must use the dedicated social card`);
  assert(html.includes('property="og:image:width" content="1200"'), `${page} is missing the OG image width`);
  assert(html.includes('property="og:image:height" content="630"'), `${page} is missing the OG image height`);
  assert(html.includes('name="twitter:card" content="summary_large_image"'), `${page} is missing the Twitter card`);
  assert(!html.includes('rel="preload" as="image" href="./media/previews-v2/') && !html.includes('rel="preload" as="image" href="../media/previews-v2/'), `${page} must not preload the full preview catalog`);
  const cropStart = html.indexOf('<article class="dataset-card" id="dataset-crop-area-output">');
  const cropEnd = html.indexOf("</article>", cropStart) + "</article>".length;
  assert(cropStart >= 0 && cropEnd >= "</article>".length, `${page} is missing the Muen Rai card`);
  const cropCard = html.slice(cropStart, cropEnd);
  assert(cropCard.split(muenRaiRoute).length - 1 === 2, `${page} must use the direct Phrae route for both Muen Rai card links`);
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || "";
  assert(jsonLd.includes(muenRaiRoute), `${page} JSON-LD must use the direct Phrae route`);
  assert(!html.includes(oldMuenRaiRoute), `${page} still contains the generic Muen Rai route`);
}

assert(readFileSync(join(root, "en/index.html"), "utf8").includes('property="og:locale:alternate" content="th_TH"'), "English alternate locale must be th_TH");

for (const language of ["th", "en"]) {
  const qr = join(root, "media/qr", `citymeter-page-${language}.png`);
  assert(existsSync(qr) && statSync(qr).size > 1000, `Missing or empty page QR: ${language}`);
}

assert(
  sha256(join(root, "media/qr/crop-area-output.png")) === "6d7b4ba9bcd42f130ccb6f6c6571dab888e476de376bb1e843ad9611ac38d530",
  "Muen Rai QR must encode the direct Phrae route"
);

for (const record of review.records) {
  const slug = record.id.replace(/^dataset-/, "");
  const qr = join(root, "media/qr", `${slug}.png`);
  const preview = join(root, "media/previews-v2", `${slug}.webp`);
  assert(existsSync(qr) && statSync(qr).size > 1000, `Missing or empty QR: ${slug}`);
  assert(existsSync(preview) && statSync(preview).size > 10000, `Missing or empty preview: ${slug}`);
}

for (const asset of [
  "assets/catalog-enhancements.js",
  "assets/catalog-enhancements.css",
  "assets/index-qbT50gkr-v3.js",
  "scripts/build-hero-reel.sh",
  "scripts/apply-focus-copy.mjs",
  "media/gdcatalog-logo.png",
  "media/reel/citymeter-proof-v3.mp4",
  "media/reel/citymeter-proof-v3-exhibition.mp4",
  "media/reel/citymeter-proof-v3-poster.webp",
  "media/social/citymeter-share-2026-08-14.jpg"
]) {
  assert(existsSync(join(root, asset)) && statSync(join(root, asset)).size > 0, `Missing release asset: ${asset}`);
}

const thHtml = readFileSync(join(root, "index.html"), "utf8");
const enHtml = readFileSync(join(root, "en/index.html"), "utf8");
const enhancementJs = readFileSync(join(root, "assets/catalog-enhancements.js"), "utf8");
assert(thHtml.includes("สวนพลู · อาคาร 3 มิติ · GFA"), "Thai page must label the Suan Plu 3D Building snapshot");
assert(thHtml.includes("เมืองชลบุรี · ราคาประเมิน 3 มิติ"), "Thai page must label the Mueang Chonburi 3D appraisal snapshot");
assert(thHtml.includes("ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี"), "Thai page must label the focused Phak Hai flood snapshot");
assert(thHtml.includes("ปทุมวัน · Road DNA · รูปแบบถนน"), "Thai page must label the focused Pathum Wan Road DNA snapshot");
assert(thHtml.includes("เวียงทอง · ผลผลิตรายเดือน"), "Thai page must label the focused Wiang Thong crop snapshot");
assert(thHtml.includes("24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน"), "Thai page must label the focused flash-flood snapshot");
assert(enHtml.includes("Suan Plu · 3D buildings · GFA"), "English page must label the Suan Plu 3D Building snapshot");
assert(enHtml.includes("Mueang Chonburi · 3D appraisal"), "English page must label the Mueang Chonburi 3D appraisal snapshot");
assert(enHtml.includes("Phak Hai · 14-year flood history"), "English page must label the focused Phak Hai flood snapshot");
assert(enHtml.includes("Pathum Wan · Road DNA · archetypes"), "English page must label the focused Pathum Wan Road DNA snapshot");
assert(enHtml.includes("Wiang Thong · monthly output"), "English page must label the focused Wiang Thong crop snapshot");
assert(enHtml.includes("24-hour flash-flood risk by province"), "English page must label the focused flash-flood snapshot");
assert(enhancementJs.includes("__CITYMETER_MOTION_DEBUG__"), "Motion debug receipt is missing");
assert(enhancementJs.includes("prefers-reduced-motion: reduce"), "Motion layer must respect reduced motion");
assert(enhancementJs.includes("duration: 280"), "Card reflow motion must use the 280ms map-state duration");
assert(enhancementJs.includes("record?.citymeterUrl"), "Runtime direct-route override is missing");
assert(enhancementJs.includes(".dataset-mobile-link"), "Runtime direct-route override must cover the mobile handoff link");
assert(thHtml.includes("ดูต่อบนมือถือ"), "Thai page is missing the permanent handoff eyebrow");
assert(thHtml.includes("เก็บตัวอย่างนี้ไว้ใช้ เมื่อต้องตัดสินใจเรื่องพื้นที่"), "Thai page is missing the permanent handoff title");
assert(thHtml.includes("สแกน QR เพื่อเปิดบนมือถือ เก็บลิงก์ไว้ดูเอง หรือส่งให้เพื่อนที่กำลังเลือกบ้าน ทำเลธุรกิจ หรือพื้นที่ลงทุน"), "Thai page is missing the permanent handoff support copy");
assert(thHtml.includes("เก็บลิงก์หรือส่งให้เพื่อน"), "Thai page is missing the permanent handoff share CTA");
assert(thHtml.includes("ลิงก์จะเปิดตัวอย่างและข้อมูลชุดเดียวกัน"), "Thai page is missing the permanent handoff note");
assert(enHtml.includes("Continue on your phone"), "English page is missing the permanent handoff eyebrow");
assert(enHtml.includes("Keep this example handy for a place decision"), "English page is missing the permanent handoff title");
assert(enHtml.includes("Scan to open it on your phone, save it for yourself, or share it with someone choosing a home, business location, or investment area."), "English page is missing the permanent handoff support copy");
assert(enHtml.includes("Save or share this example"), "English page is missing the permanent handoff share CTA");
assert(enHtml.includes("The link opens the same example and data."), "English page is missing the permanent handoff note");

const mainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v3.js"), "utf8");
assert(mainBundle.includes("เก็บตัวอย่างนี้ไว้ใช้ เมื่อต้องตัดสินใจเรื่องพื้นที่"), "Hydrated Thai handoff title is stale");
assert(mainBundle.includes("สแกน QR เพื่อเปิดบนมือถือ เก็บลิงก์ไว้ดูเอง หรือส่งให้เพื่อนที่กำลังเลือกบ้าน ทำเลธุรกิจ หรือพื้นที่ลงทุน"), "Hydrated Thai handoff support copy is stale");
assert(mainBundle.includes("เก็บลิงก์หรือส่งให้เพื่อน"), "Hydrated Thai handoff CTA is stale");
assert(mainBundle.includes("ลิงก์จะเปิดตัวอย่างและข้อมูลชุดเดียวกัน"), "Hydrated Thai handoff note is stale");
assert(mainBundle.includes("Keep this example handy for a place decision"), "Hydrated English handoff title is stale");
assert(mainBundle.includes("Scan to open it on your phone, save it for yourself, or share it with someone choosing a home, business location, or investment area."), "Hydrated English handoff support copy is stale");
assert(mainBundle.includes("Save or share this example"), "Hydrated English handoff CTA is stale");
assert(mainBundle.includes("The link opens the same example and data."), "Hydrated English handoff note is stale");
assert(!mainBundle.includes("after the exhibition"), "Hydrated bundle still contains exhibition-only handoff copy");
assert(!mainBundle.includes("ส่งตัวอย่างนี้ให้ทีม"), "Hydrated bundle still contains team-only handoff copy");

assert(
  sha256(join(root, "media/reel/citymeter-proof-v3.mp4")) === "9b075ee35eaa9c9d41dacb8e0580a5dbb07b26076d723c4185810678f1520bf5",
  "Web video changed in a snapshot-only release"
);
assert(
  sha256(join(root, "media/reel/citymeter-proof-v3-exhibition.mp4")) === "eb382551b5b2778dad5a0db7045a311b42823121f23c0380a234261b7ceedd2e",
  "Exhibition video changed in a snapshot-only release"
);

console.log("CityMETER release validation passed: 38 cards, direct Phrae Muen Rai route, permanent handoff copy, focused snapshots, 280ms state motion, reduced-motion fallback, and unchanged videos.");
