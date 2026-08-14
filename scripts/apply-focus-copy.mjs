import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const replacements = {
  "index.html": [
    ["catalog-enhancements.css?v=4", "catalog-enhancements.css?v=5"],
    ["catalog-enhancements.js?v=6", "catalog-enhancements.js?v=7"],
    ["GFA · ความสูง · จำนวนชั้น", "สวนพลู · อาคาร 3 มิติ · GFA"],
    [
      "ใช้แผนที่เปรียบเทียบจังหวัดคู่กับ GFA ความสูง และจำนวนชั้น เพื่อเล่าความเข้มข้นของการพัฒนา",
      "สำรวจความเข้มข้นของอาคาร GFA ความสูง และจำนวนชั้นแบบ 3 มิติในสวนพลู"
    ],
    ["ราคาประเมิน · จำนวนโฉนด", "เมืองชลบุรี · ราคาประเมิน 3 มิติ"],
    [
      "ใช้แผนที่ราคาประเมินระดับจังหวัดคู่กับจำนวนโฉนดและการกระจายราคา",
      "เห็นโครงสร้างราคาประเมินที่ดินแบบ 3 มิติในอำเภอเมืองชลบุรี พร้อมจำนวนโฉนดและการกระจายราคา"
    ],
    ["14 ปี · การเกิดซ้ำ · ปีหนักสุด", "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี"],
    [
      "ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง",
      "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี"
    ],
    ["รูปแบบถนน · ทางตัน · ทางแยก", "ปทุมวัน · Road DNA · รูปแบบถนน"],
    [
      "ใช้พื้นที่สีบนแผนที่ดาวเทียมคู่กับสัดส่วนทางตันและความหนาแน่นทางแยก",
      "สำรวจรูปแบบโครงข่ายถนนในปทุมวัน พร้อมสัดส่วนทางตัน ความหนาแน่นทางแยก และ Road DNA"
    ],
    ["พื้นที่เพาะปลูก · ผลผลิต", "เวียงทอง · ผลผลิตรายเดือน"],
    [
      "ใช้ชนิดพืช พื้นที่เพาะปลูก ผลผลิต และช่วงเวลาเล่าบริบทการใช้ที่ดินเกษตร",
      "ดูพื้นที่เพาะปลูกและผลผลิตรายเดือนใน อบต.เวียงทอง พร้อมแยกชนิดพืชและกราฟช่วงเวลา"
    ],
    ["สัญญาณความเสี่ยง 24 ชั่วโมง", "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน"],
    [
      "ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง",
      "เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน"
    ]
  ],
  "en/index.html": [
    ["catalog-enhancements.css?v=4", "catalog-enhancements.css?v=5"],
    ["catalog-enhancements.js?v=6", "catalog-enhancements.js?v=7"],
    ["GFA · height · floors", "Suan Plu · 3D buildings · GFA"],
    [
      "Pair the province comparison map with GFA, height, and floor metrics to explain development intensity",
      "Explore 3D building intensity, GFA, height and floor counts in Suan Plu"
    ],
    ["Appraisal · deed counts", "Mueang Chonburi · 3D appraisal"],
    [
      "Pair the province appraisal map with title-deed counts and price distribution",
      "See the 3D land-appraisal pattern across Mueang Chonburi with deed counts and the price distribution"
    ],
    ["14 years · recurrence · worst year", "Phak Hai · 14-year flood history"],
    [
      "Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline",
      "See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart"
    ],
    ["Road types · dead ends · intersections", "Pathum Wan · Road DNA · archetypes"],
    [
      "Pair coloured archetype areas on the satellite map with dead-end and intersection metrics",
      "Explore Pathum Wan road-network archetypes with dead-end ratio, intersection density and Road DNA"
    ],
    ["Crop area · output", "Wiang Thong · monthly output"],
    [
      "Use crop type, cultivated area, output, and period to explain agricultural land context",
      "See monthly cultivated area and output in Wiang Thong TAO, separated by crop and time period"
    ],
    ["24-hour risk signal", "24-hour flash-flood risk by province"],
    [
      "Use the 24-hour risk levels, province ranking, and run time as a monitoring story",
      "See 24-hour risk levels across Thailand with province ranking and forecast run time"
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
    ],
    "dataset-flood-recurrent": [
      ["มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ", "ภาพตัวอย่างโฟกัสอำเภอผักไห่ พระนครศรีอยุธยา; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ"],
      ["ระดับพื้นที่ย่อยสุดยังไม่ยืนยันจากหน้าสาธารณะ", "ภาพแสดงขอบเขตอำเภอ พื้นที่น้ำท่วม และสรุประดับตำบล; ความละเอียดของข้อมูลน้ำท่วมต้นทางยังไม่ยืนยัน"]
    ],
    "dataset-road-network-archetypes": [
      ["ยืนยันจากเส้นทางกรุงเทพฯ ที่ตรวจ; ขอบเขตพื้นที่อื่นยังไม่ยืนยัน", "ภาพตัวอย่างโฟกัสเขตปทุมวัน กรุงเทพมหานคร; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ยืนยัน"],
      ["เห็นพื้นที่สีตามรูปแบบโครงข่ายถนน แต่หน่วยวิเคราะห์พื้นฐานยังไม่มีคำอธิบายสาธารณะ", "ภาพแสดงพื้นที่วิเคราะห์แบบ hexagon และตัวชี้วัด Road DNA; วิธีสร้างหน่วยวิเคราะห์ยังไม่มีคำอธิบายสาธารณะ"]
    ],
    "dataset-crop-area-output": [
      ["ขอบเขตพื้นที่ยังไม่ระบุบนหน้าสาธารณะ", "ภาพตัวอย่างโฟกัส อบต.เวียงทอง จังหวัดแพร่; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ"],
      ["ระดับพื้นที่ย่อยสุดยังไม่ยืนยันจากหน้าสาธารณะ", "ภาพแสดงหน่วยหมู่บ้านและกริด hexagon พร้อมสรุปผลผลิต; วิธีแปลงข้อมูลต้นทางยังไม่ยืนยัน"]
    ],
    "dataset-flood-forecast-flash-flood-risk": [
      ["มีหน้าสรุประดับประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลยังไม่ระบุ", "ภาพตัวอย่างแสดงภาพรวมประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลต้นทางยังไม่ระบุบนหน้าสาธารณะ"],
      ["ยืนยันการเปรียบเทียบระดับจังหวัด; ความละเอียดระดับลุ่มน้ำหรือพื้นผิวโมเดลยังไม่เผยแพร่", "ภาพยืนยันการเปรียบเทียบระดับจังหวัด; ความละเอียดระดับลุ่มน้ำหรือพื้นผิวโมเดลยังไม่เผยแพร่"]
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
    ],
    "dataset-flood-recurrent": [
      ["A Thailand summary view is visible; source coverage is not stated", "The example focuses on Phak Hai, Phra Nakhon Si Ayutthaya; source coverage beyond the example is not stated on the public page"],
      ["The smallest supported geography is not yet verified from the public page", "The view shows district extent, flooded areas and subdistrict summaries; source flood-data resolution is not verified"]
    ],
    "dataset-road-network-archetypes": [
      ["Evidenced on the inspected Bangkok route; broader geographic coverage is not verified", "The example focuses on Pathum Wan, Bangkok; source coverage beyond the example is not verified"],
      ["Coloured road-archetype areas are visible, but the underlying analytical unit is not publicly documented", "The view shows hexagonal analysis areas and Road DNA metrics; construction of the analytical unit is not publicly documented"]
    ],
    "dataset-crop-area-output": [
      ["Geographic coverage is not stated on the public page", "The example focuses on Wiang Thong TAO, Phrae; source coverage beyond the example is not stated on the public page"],
      ["The smallest supported geography is not yet verified from the public page", "The view shows village units, a hexagonal grid and output summaries; transformation from the source data is not verified"]
    ],
    "dataset-flood-forecast-flash-flood-risk": [
      ["A Thailand summary and province ranking are visible; model coverage is not stated", "The example shows a Thailand overview and province ranking; source-model coverage is not stated on the public page"],
      ["Province comparison is evidenced; watershed or model-surface resolution is not published", "Province comparison is evidenced; watershed or model-surface resolution is not published"]
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
  if (relativePath === "en/index.html") html = html.replaceAll("Riang Thong", "Wiang Thong");
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

console.log("Applied focused snapshot copy and motion cache revisions to prerendered HTML.");
