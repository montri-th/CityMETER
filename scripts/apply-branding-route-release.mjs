import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-15-pillar-card-surfaces";

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

const hydrationParity = {
  "index.html": [
    ["สวนพลู · อาคาร 3 มิติ · GFA", "GFA · ความสูง · จำนวนชั้น"],
    ["สำรวจความเข้มข้นของอาคาร GFA ความสูง และจำนวนชั้นแบบ 3 มิติในสวนพลู", "ใช้แผนที่เปรียบเทียบจังหวัดคู่กับ GFA ความสูง และจำนวนชั้น เพื่อเล่าความเข้มข้นของการพัฒนา"],
    ["ภาพตัวอย่างโฟกัสสวนพลู; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ", "มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ"],
    ["ภาพแสดงอาคาร 3 มิติและตัวชี้วัดระดับพื้นที่; ความครบถ้วนของรูปทรงรายอาคารยังไม่ยืนยัน", "ยืนยันแผนที่เปรียบเทียบระดับจังหวัดและตัวชี้วัดอาคาร; รูปทรงแผนที่ระดับอาคารยังไม่ยืนยัน"],
    ["เมืองชลบุรี · ราคาประเมิน 3 มิติ", "ราคาประเมิน · จำนวนโฉนด"],
    ["เห็นโครงสร้างราคาประเมินที่ดินแบบ 3 มิติในอำเภอเมืองชลบุรี พร้อมจำนวนโฉนดและการกระจายราคา", "ใช้แผนที่ราคาประเมินระดับจังหวัดคู่กับจำนวนโฉนดและการกระจายราคา"],
    ["ภาพตัวอย่างโฟกัสอำเภอเมืองชลบุรี; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ", "มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ"],
    ["ภาพแสดงโซนราคาประเมินแบบ 3 มิติและจำนวนโฉนด; รายละเอียดรูปแปลงรายแปลงยังไม่ยืนยัน", "ยืนยันแผนที่เปรียบเทียบระดับจังหวัดและจำนวนโฉนด; รายละเอียดรูปแปลงยังไม่ยืนยัน"],
    ["ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี", "14 ปี · การเกิดซ้ำ · ปีหนักสุด"],
    ["เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี", "ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง"],
    ["ภาพตัวอย่างโฟกัสอำเภอผักไห่ พระนครศรีอยุธยา; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ", "มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ"],
    ["ภาพแสดงขอบเขตอำเภอ พื้นที่น้ำท่วม และสรุประดับตำบล; ความละเอียดของข้อมูลน้ำท่วมต้นทางยังไม่ยืนยัน", "ระดับพื้นที่ย่อยสุดยังไม่ยืนยันจากหน้าสาธารณะ"],
    ["ปทุมวัน · Road DNA · รูปแบบถนน", "รูปแบบถนน · ทางตัน · ทางแยก"],
    ["สำรวจรูปแบบโครงข่ายถนนในปทุมวัน พร้อมสัดส่วนทางตัน ความหนาแน่นทางแยก และ Road DNA", "ใช้พื้นที่สีบนแผนที่ดาวเทียมคู่กับสัดส่วนทางตันและความหนาแน่นทางแยก"],
    ["ภาพตัวอย่างโฟกัสเขตปทุมวัน กรุงเทพมหานคร; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ยืนยัน", "ยืนยันจากเส้นทางกรุงเทพฯ ที่ตรวจ; ขอบเขตพื้นที่อื่นยังไม่ยืนยัน"],
    ["ภาพแสดงพื้นที่วิเคราะห์แบบ hexagon และตัวชี้วัด Road DNA; วิธีสร้างหน่วยวิเคราะห์ยังไม่มีคำอธิบายสาธารณะ", "เห็นพื้นที่สีตามรูปแบบโครงข่ายถนน แต่หน่วยวิเคราะห์พื้นฐานยังไม่มีคำอธิบายสาธารณะ"],
    ["เวียงทอง · ผลผลิตรายเดือน", "พื้นที่เพาะปลูก · ผลผลิต"],
    ["ดูพื้นที่เพาะปลูกและผลผลิตรายเดือนใน อบต.เวียงทอง พร้อมแยกชนิดพืชและกราฟช่วงเวลา", "ใช้ชนิดพืช พื้นที่เพาะปลูก ผลผลิต และช่วงเวลาเล่าบริบทการใช้ที่ดินเกษตร"],
    ["ภาพตัวอย่างโฟกัส อบต.เวียงทอง จังหวัดแพร่; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ", "ขอบเขตพื้นที่ยังไม่ระบุบนหน้าสาธารณะ"],
    ["ภาพแสดงหน่วยหมู่บ้านและกริด hexagon พร้อมสรุปผลผลิต; วิธีแปลงข้อมูลต้นทางยังไม่ยืนยัน", "ระดับพื้นที่ย่อยสุดยังไม่ยืนยันจากหน้าสาธารณะ"],
    ["24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน", "สัญญาณความเสี่ยง 24 ชั่วโมง"],
    ["เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน", "ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง"],
    ["ภาพตัวอย่างแสดงภาพรวมประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลต้นทางยังไม่ระบุบนหน้าสาธารณะ", "มีหน้าสรุประดับประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลยังไม่ระบุ"],
    ["ภาพยืนยันการเปรียบเทียบระดับจังหวัด; ความละเอียดระดับลุ่มน้ำหรือพื้นผิวโมเดลยังไม่เผยแพร่", "ยืนยันการเปรียบเทียบระดับจังหวัด; ความละเอียดระดับลุ่มน้ำหรือพื้นผิวโมเดลยังไม่เผยแพร่"]
  ],
  "en/index.html": [
    ["Suan Plu · 3D buildings · GFA", "GFA · height · floors"],
    ["Explore 3D building intensity, GFA, height and floor counts in Suan Plu", "Pair the province comparison map with GFA, height, and floor metrics to explain development intensity"],
    ["The example focuses on Suan Plu; source coverage beyond the example is not stated on the public page", "A Thailand summary view is visible; source coverage is not stated"],
    ["The view shows 3D buildings and area metrics; completeness of individual building geometry is not verified", "A province comparison map and building metrics are visible; building-level map geometry is not verified"],
    ["Mueang Chonburi · 3D appraisal", "Appraisal · deed counts"],
    ["See the 3D land-appraisal pattern across Mueang Chonburi with deed counts and the price distribution", "Pair the province appraisal map with title-deed counts and price distribution"],
    ["The example focuses on Mueang Chonburi; source coverage beyond the example is not stated on the public page", "A Thailand summary view is visible; source coverage is not stated"],
    ["The view shows 3D appraisal-price zones and deed counts; individual parcel geometry is not verified", "A province comparison map and title-deed counts are visible; individual plot geometry is not verified"],
    ["Phak Hai · 14-year flood history", "14 years · recurrence · worst year"],
    ["See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart", "Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline"],
    ["The example focuses on Phak Hai, Phra Nakhon Si Ayutthaya; source coverage beyond the example is not stated on the public page", "A Thailand summary view is visible; source coverage is not stated"],
    ["The view shows district extent, flooded areas and subdistrict summaries; source flood-data resolution is not verified", "The smallest supported geography is not yet verified from the public page"],
    ["Pathum Wan · Road DNA · archetypes", "Road types · dead ends · intersections"],
    ["Explore Pathum Wan road-network archetypes with dead-end ratio, intersection density and Road DNA", "Pair coloured archetype areas on the satellite map with dead-end and intersection metrics"],
    ["The example focuses on Pathum Wan, Bangkok; source coverage beyond the example is not verified", "Evidenced on the inspected Bangkok route; broader geographic coverage is not verified"],
    ["The view shows hexagonal analysis areas and Road DNA metrics; construction of the analytical unit is not publicly documented", "Coloured road-archetype areas are visible, but the underlying analytical unit is not publicly documented"],
    ["Wiang Thong · monthly output", "Crop area · output"],
    ["See monthly cultivated area and output in Wiang Thong TAO, separated by crop and time period", "Use crop type, cultivated area, output, and period to explain agricultural land context"],
    ["The example focuses on Wiang Thong TAO, Phrae; source coverage beyond the example is not stated on the public page", "Geographic coverage is not stated on the public page"],
    ["The view shows village units, a hexagonal grid and output summaries; transformation from the source data is not verified", "The smallest supported geography is not yet verified from the public page"],
    ["24-hour flash-flood risk by province", "24-hour risk signal"],
    ["See 24-hour risk levels across Thailand with province ranking and forecast run time", "Use the 24-hour risk levels, province ranking, and run time as a monitoring story"],
    ["The example shows a Thailand overview and province ranking; source-model coverage is not stated on the public page", "A Thailand summary and province ranking are visible; model coverage is not stated"],
    ["Province comparison is evidenced; watershed or model-surface resolution is not published", "Province comparison is evidenced; watershed or model-surface resolution is not published"]
  ]
};

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

function updateShowcasePillars(html, page) {
  let cursor = 0;
  let count = 0;
  const counts = { land: 0, location: 0, living: 0 };

  while (true) {
    const start = html.indexOf('<article class="showcase-card', cursor);
    if (start < 0) break;
    const end = html.indexOf("</article>", start) + "</article>".length;
    if (end < "</article>".length) throw new Error(`Unclosed showcase card in ${page}`);
    const card = html.slice(start, end);
    const group = card.match(/<span class="record-group">(LAND|LOCATION|LIVING)<\/span>/)?.[1]?.toLowerCase();
    if (!group) throw new Error(`Showcase pillar not found in ${page} at index ${start}`);
    const updated = card.replace(
      /(<article class="showcase-card[^"]*")(?: data-pillar="[^"]+")?/,
      `$1 data-pillar="${group}"`
    );
    html = html.slice(0, start) + updated + html.slice(end);
    cursor = start + updated.length;
    counts[group] += 1;
    count += 1;
  }

  if (count !== 6 || counts.land !== 1 || counts.location !== 3 || counts.living !== 2) {
    throw new Error(`Unexpected showcase pillar counts in ${page}: ${JSON.stringify(counts)}`);
  }
  return html;
}

function updatePage(page) {
  const path = join(root, page);
  const assetPrefix = page === "index.html" ? "./" : "../";
  const baseStylesheet = `<link rel="stylesheet" crossorigin href="${assetPrefix}assets/index-cqxdfePB.css?v=2">`;
  const fontStylesheet = `<link rel="stylesheet" href="${assetPrefix}assets/citymeter-fonts.css?v=1">`;
  const allCriticalFontPreloads = [
    "arvo-latin-700-normal-jvQUOvPP.woff2",
    "bai-jamjuree-thai-400-normal-CvLA45ZU.woff2",
    "bai-jamjuree-thai-600-normal-CzTxzpuq.woff2",
    "bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2",
    "bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2",
    "jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
    "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2"
  ];
  const criticalFontPreloads = page === "index.html"
    ? [
        "arvo-latin-700-normal-jvQUOvPP.woff2",
        "bai-jamjuree-thai-400-normal-CvLA45ZU.woff2",
        "bai-jamjuree-thai-600-normal-CzTxzpuq.woff2",
        "jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
        "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2"
      ]
    : [
        "arvo-latin-700-normal-jvQUOvPP.woff2",
        "bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2",
        "bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2",
        "jetbrains-mono-latin-400-normal-V6pRDFza.woff2"
      ];
  let html = readFileSync(path, "utf8");
  html = html
    .replace("ก่อนตัดสินใจเรื่องพื้นที่\nดูให้เห็นมากกว่าจุดบนแผนที่", "CityMETER")
    .replace("Before you decide on a place,\nsee more than pins on a map", "CityMETER")
    .replace("คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน", "คุยกับทีม Landometer")
    .replace("Ask the Landometer team where to start", "Talk to the Landometer team")
    .replaceAll("citymeter-share-2026-08-14.jpg", "citymeter-land-appraisal-share-2026-08-14.jpg")
    .replaceAll("หน้าจอ CityMETER แสดงข้อมูลการท่องเที่ยวบนแผนที่ประเทศไทย", "หน้าจอ CityMETER แสดงราคาประเมินที่ดินด้วยแท่งข้อมูลสามมิติบนแผนที่")
    .replaceAll("CityMETER screen showing tourism data across Thailand", "CityMETER Land Appraisal screen showing 3D data columns on a map")
    .replaceAll("catalog-enhancements.css?v=5", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=6", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=7", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=8", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=9", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=10", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=11", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=12", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=13", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.css?v=14", "catalog-enhancements-v15.css")
    .replaceAll("catalog-enhancements.js?v=8", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=9", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=10", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=11", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=12", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=13", "catalog-enhancements.js?v=15")
    .replaceAll("catalog-enhancements.js?v=14", "catalog-enhancements.js?v=15")
    .replaceAll("index-cqxdfePB.css?v=1", "index-cqxdfePB.css?v=2")
    .replaceAll("index-cqxdfePB.css\"", "index-cqxdfePB.css?v=2\"")
    .replace('<h1 id="page-title">', '<h1 id="page-title" lang="en">')
    .replace('<a class="citymeter-label" href="#top">', '<a class="citymeter-label" href="#top" lang="en">')
    .replaceAll("index-qbT50gkr-v3.js?v=2", "index-qbT50gkr-v4.js")
    .replaceAll("index-qbT50gkr-v3.js?v=3", "index-qbT50gkr-v4.js")
    .replaceAll("index-qbT50gkr-v3.js?v=4", "index-qbT50gkr-v4.js")
    .replaceAll("index-qbT50gkr-v3.js?v=5", "index-qbT50gkr-v4.js");

  if (html.includes('name="citymeter:release-receipt"')) {
    html = html.replace(
      /(<meta name="citymeter:release-receipt" content=")[^"]*(" \/>)/,
      `$1${releaseReceipt}$2`
    );
  } else {
    html = html.replace(
      '<meta name="citymeter:catalog-version" content="2026-08-14" />',
      `<meta name="citymeter:catalog-version" content="2026-08-14" />\n    <meta name="citymeter:release-receipt" content="${releaseReceipt}" />`
    );
  }

  if (!html.includes(fontStylesheet)) {
    if (!html.includes(baseStylesheet)) throw new Error(`Base stylesheet not found in ${page}`);
    html = html.replace(baseStylesheet, `${baseStylesheet}\n    ${fontStylesheet}`);
  }
  for (const fontFile of allCriticalFontPreloads) {
    if (criticalFontPreloads.includes(fontFile)) continue;
    const preload = `<link rel="preload" as="font" type="font/woff2" href="${assetPrefix}assets/${fontFile}" crossorigin />`;
    html = html.replaceAll(`    ${preload}\n`, "").replaceAll(preload, "");
  }
  for (const fontFile of criticalFontPreloads) {
    const preload = `<link rel="preload" as="font" type="font/woff2" href="${assetPrefix}assets/${fontFile}" crossorigin />`;
    if (!html.includes(preload)) html = html.replace("    <title>", `    ${preload}\n    <title>`);
  }

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
    const group = card.match(/<div class="dataset-kicker"><span>(land|location|living)<\/span>/)?.[1];
    if (!group) throw new Error(`Dataset pillar not found in ${page}: ${id}`);
    let replacements = 0;
    const updated = card
      .replace(
        new RegExp(`(<article class="dataset-card" id="${id}")(?: data-pillar="[^"]+")?`),
        `$1 data-pillar="${group}"`
      )
      .replace(/(<a class="dataset-(?:image|open)" href=")[^"]+("[^>]*>)/g, (_match, before, after) => {
        replacements += 1;
        return `${before}${route}${after}`;
      });
    if (replacements !== 2) throw new Error(`Expected two primary links for ${id} in ${page}; found ${replacements}`);
    html = html.slice(0, start) + updated + html.slice(end);
  }

  html = updateShowcasePillars(html, page);
  html = updateJsonLd(html, page);
  for (const [focusedCopy, hydrationBaseline] of hydrationParity[page]) {
    html = html.replaceAll(focusedCopy, hydrationBaseline);
  }
  writeFileSync(path, html);
}

function updateHydratedBundle() {
  const priorPath = join(root, "assets/index-qbT50gkr-v3.js");
  const path = join(root, "assets/index-qbT50gkr-v4.js");
  let source = readFileSync(existsSync(path) ? path : priorPath, "utf8");
  const replacements = [
    [`ก่อนตัดสินใจเรื่องพื้นที่
ดูให้เห็นมากกว่าจุดบนแผนที่`, "CityMETER"],
    [`Before you decide on a place,
see more than pins on a map`, "CityMETER"],
    ["คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน", "คุยกับทีม Landometer"],
    ["Ask the Landometer team where to start", "Talk to the Landometer team"],
    ['id:"page-title",children:c.hero.title', 'id:"page-title",lang:"en",children:c.hero.title'],
    ['className:"citymeter-label",href:"#top",children:"CityMETER"', 'className:"citymeter-label",href:"#top",lang:"en",children:"CityMETER"'],
    ['className:d<2?"showcase-card showcase-card-wide":"showcase-card",children:', 'className:d<2?"showcase-card showcase-card-wide":"showcase-card","data-pillar":s.group,children:'],
    ['className:"dataset-card",id:', 'className:"dataset-card","data-pillar":c.group,id:']
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

console.log("Applied CityMETER headline, immutable enhancement CSS v15 and hydrated bundle v4, canonical fonts, true-edge radial supporter logos, scroll-end containment, concise contact CTA, Land Appraisal social card, exact quiet Land/Location/Living card surfaces, 38 canonical routes, hydration parity and benefit-first source details.");
