import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const replacements = {
  "index.html": [
    ["catalog-enhancements.js?v=4", "catalog-enhancements.js?v=5"],
    ["GFA · ความสูง · จำนวนชั้น", "สวนพลู · อาคาร 3 มิติ · GFA"],
    [
      "ใช้แผนที่เปรียบเทียบจังหวัดคู่กับ GFA ความสูง และจำนวนชั้น เพื่อเล่าความเข้มข้นของการพัฒนา",
      "สำรวจความเข้มข้นของอาคาร GFA ความสูง และจำนวนชั้นแบบ 3 มิติในสวนพลู"
    ],
    ["ราคาประเมิน · จำนวนโฉนด", "เมืองชลบุรี · ราคาประเมิน 3 มิติ"],
    [
      "ใช้แผนที่ราคาประเมินระดับจังหวัดคู่กับจำนวนโฉนดและการกระจายราคา",
      "เห็นโครงสร้างราคาประเมินที่ดินแบบ 3 มิติในอำเภอเมืองชลบุรี พร้อมจำนวนโฉนดและการกระจายราคา"
    ]
  ],
  "en/index.html": [
    ["catalog-enhancements.js?v=4", "catalog-enhancements.js?v=5"],
    ["GFA · height · floors", "Suan Plu · 3D buildings · GFA"],
    [
      "Pair the province comparison map with GFA, height, and floor metrics to explain development intensity",
      "Explore 3D building intensity, GFA, height and floor counts in Suan Plu"
    ],
    ["Appraisal · deed counts", "Mueang Chonburi · 3D appraisal"],
    [
      "Pair the province appraisal map with title-deed counts and price distribution",
      "See the 3D land-appraisal pattern across Mueang Chonburi with deed counts and the price distribution"
    ]
  ]
};

const cardReplacements = {
  "index.html": {
    "dataset-buildings": [
      ["มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ", "ภาพตัวอย่างโฟกัสสวนพลู; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ"],
      ["ยืนยันแผนที่เปรียบเทียบระดับจังหวัดและตัวชี้วัดอาคาร; รูปทรงแผนที่ระดับอาคารยังไม่ยืนยัน", "ภาพแสดงอาคาร 3 มิติและตัวชี้วัดระดับพื้นที่; ความครบถ้วนของรูปทรงรายอาคารยังไม่ยืนยัน"]
    ],
    "dataset-land-appraisal": [
      ["มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ", "ภาพตัวอย่างโฟกัสอำเภอเมืองชลบุรี; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ"],
      ["ยืนยันแผนที่เปรียบเทียบระดับจังหวัดและจำนวนโฉนด; รายละเอียดรูปแปลงยังไม่ยืนยัน", "ภาพแสดงโซนราคาประเมินแบบ 3 มิติและจำนวนโฉนด; รายละเอียดรูปแปลงรายแปลงยังไม่ยืนยัน"]
    ]
  },
  "en/index.html": {
    "dataset-buildings": [
      ["A Thailand summary view is visible; source coverage is not stated", "The example focuses on Suan Plu; source coverage beyond the example is not stated on the public page"],
      ["A province comparison map and building metrics are visible; building-level map geometry is not verified", "The view shows 3D buildings and area metrics; completeness of individual building geometry is not verified"]
    ],
    "dataset-land-appraisal": [
      ["A Thailand summary view is visible; source coverage is not stated", "The example focuses on Mueang Chonburi; source coverage beyond the example is not stated on the public page"],
      ["A province comparison map and title-deed counts are visible; individual plot geometry is not verified", "The view shows 3D appraisal-price zones and deed counts; individual parcel geometry is not verified"]
    ]
  }
};

function replaceIdempotently(value, from, to, scope) {
  if (value.includes(from)) return value.replaceAll(from, to);
  if (value.includes(to)) return value;
  throw new Error(`${scope} is missing expected copy: ${from}`);
}

for (const [relativePath, pairs] of Object.entries(replacements)) {
  const path = join(root, relativePath);
  let html = readFileSync(path, "utf8");
  for (const [from, to] of pairs) html = replaceIdempotently(html, from, to, relativePath);
  for (const [cardId, cardPairs] of Object.entries(cardReplacements[relativePath])) {
    const start = html.indexOf(`<article class="dataset-card" id="${cardId}">`);
    const end = html.indexOf("</article>", start) + "</article>".length;
    if (start < 0 || end < "</article>".length) throw new Error(`${relativePath} is missing ${cardId}`);
    let card = html.slice(start, end);
    for (const [from, to] of cardPairs) card = replaceIdempotently(card, from, to, `${relativePath}#${cardId}`);
    html = `${html.slice(0, start)}${card}${html.slice(end)}`;
  }
  writeFileSync(path, html);
}

console.log("Applied Suan Plu and Mueang Chonburi focus copy to prerendered HTML.");
