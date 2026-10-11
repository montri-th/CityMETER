# CityMETER — implementation handoff, 11 October 2026

สถานะ: **locally_verified_release_pending** — implementation และผลตรวจในเครื่องของรอบนี้บันทึกแล้ว; `verification_pending: true` ยังครอบคลุม exact-head CI, Pages และการตรวจไฟล์บนเว็บจริง ผลเผยแพร่ต้องผูกกับ commit/tree และ receipt ใหม่แยกจากเอกสารนี้ ดูสัญญาเครื่องใน [claude-design-handoff-20261011.json](./claude-design-handoff-20261011.json)

## รับจากแบบอะไร และรักษาอะไรไว้

| ส่วน | ขอบเขตที่ได้รับอนุมัติ |
|---|---|
| บทความ dataset | ใช้ template เดียวสำหรับ 43 records / 86 หน้าไทย–อังกฤษ: hero และภาพประกอบข้อค้นพบ, facts strip 4 ช่อง, เนื้อหาเดิม, action, sources ที่เริ่มปิด, สารบัญและ reading progress, previous/next, related stories, share, navbar ร่วมและ footer |
| Catalog — สี | ใช้ foundation surfaces, typography และสีตาม LDS 0.9.7; `measure.deep` ใน hero/ส่วนส่งต่อที่แยกจากกัน; การ์ดและส่วนแสดงข้อมูลใช้พื้นตามบทบาท |
| Catalog — Examples | เจ้าของอนุมัติเพิ่มจาก README เดิม: “เปิดดูของจริง / ตัวอย่างที่พาไปถึงพื้นที่และข้อมูลต้นทาง”; RoadDNA ใหญ่ซ้าย อีก 4 ตัวอย่างขวา ได้แก่ shopping centers, buildings, recurrent flood และ population; responsive โดยคงรายการและข้อมูลเดิม; ภาพ RoadDNA เป็น close-up แบบ cover ตามแบบ ส่วนอีก 4 ภาพใช้ contain |
| Catalog — Explore | เจ้าของอนุมัติเพิ่ม: แถบค้นหา–ตัวกรอง–จำนวนรายการที่จัดแนวเดียวกัน; หัว Land / Location / Living มีสี รูปร่าง และจำนวน; เพิ่มจำนวนกลุ่มย่อย คง 3 lanes บนจอกว้าง |
| ส่วนที่รักษาไว้ | Catalog hero/decisions/handoff/contact/footer และ navbar คงโครงสร้างและพฤติกรรมเดิมนอกเหนือจากสีที่อนุมัติ; คง 43 records และลำดับ การค้นหา/ตัวกรอง ลิงก์ map/article/anchor, QR, GD badge, avatar 56px, value disclosure ที่เริ่มปิด, quiet interaction และ FLIP/reduced-motion เดิม |

HTML prototype เป็นภาพอ้างอิง ไม่ใช่โค้ดที่จะนำมาวางทับระบบ ห้ามนำ demo fetching, state, navigation หรือข้อมูลสมมติเข้าสู่ production การอนุมัติภายหลังของเจ้าของครอบคลุม **เฉพาะสอง layout sections** ที่ระบุ จึงไม่ได้อนุญาตให้ย้าย catalog ทั้งหน้าไปใช้ prototype

## ข้อมูลและภาพต้องยังหมายถึงสิ่งเดิม

- Join บทความด้วย `story.datasetCode === record.datasetCode` ใช้ `src/catalog.json`, `src/dataset-stories.json` และ public contributor projection ที่มี authority อยู่แล้ว ไม่สร้าง person, role, portrait, publisher, source period หรือ licence ใหม่จากแบบ
- ตรวจซ้ำแล้ว records ใน handoff `reference/data/catalog.json` และ `reference/data/dataset-stories.json` ตรงกับ public JSON ของรอบนี้; records ของ catalog และ source stories ตรงกับฐาน `12fb264` การเปลี่ยน catalog source จำกัดที่ `contentVersion` และ `updatedAt` เก็บผล preparation เดิมไว้ใน JSON แยกจากผลตรวจล่าสุด ไม่ใช้ byte hash ต่างกันจาก serialization สรุปว่าข้อเท็จจริงต่างกัน
- ภาพข้อค้นพบใช้ `story.snapshot` ก่อน `record.preview`; ใช้ `largePath` เมื่อมีแล้วจึง fallback `path` Caption/alt ของ snapshot มาก่อน state label หรือ focus label ของ preview ภาพแนวคิดต้องมีข้อความบอกว่าไม่ใช่ภาพหน้าข้อมูลจริง ไม่ปรับสีหรือสร้างความหมายเพิ่มให้ภาพ ภาพทุกบทความใช้ `contain`; แยก caption ของ snapshot ที่อ้างข้อค้นพบออกจาก preview ที่เพียงแสดงหน้าข้อมูล
- เวลา `evidence.observedAt` คือเวลาที่ดูตัวอย่าง ไม่ใช่วันปรับปรุง upstream หรือข้อมูล real-time เก็บพื้นที่ ตัวกรอง ช่วงเวลา หน่วย และตัวหารใน `findingContext` ตามต้นฉบับ
- Facts strip ใช้ `scripts/lib/article-facts.json` เป็นข้อความสรุป 4 ช่องจากข้อมูลเดิม ตรวจครบ 43 records × ไทย/อังกฤษ และผูก SHA-256 กับ `sourceReview`, `scope`, `granularity` ของแต่ละ record; หากต้นฉบับเปลี่ยน build ต้องหยุดให้ review ข้อความก่อน ช่องที่ยังไม่มีข้อมูลให้ลิงก์เปิดแหล่งข้อมูลเต็ม ไม่สร้างค่าทดแทน ข้อความย่อนี้ไม่ใช่ข้อเท็จจริงใหม่หรือหลักฐานยืนยัน ingestion/ความครบถ้วน และไม่ยกระดับ `partial`, `unknown` หรือ candidate reference
- Sources/caveats อยู่ใน native `<details>` ที่เริ่มปิด แต่ยังอยู่ใน HTML และเปิดอ่านได้โดยไม่ใช้ JavaScript ไม่ตัดคำเตือนที่เปลี่ยนความหมายของข้อมูล ภาพ forecast, observed data และ event archive ต้องยังแยกกันชัดเจน
- Locale Insight เป็น contextual prior เท่านั้น; ไม่ใช้แทนประชากรทางการ สิทธิบริการ ขอบเขตตามกฎหมาย ความเสี่ยง หรือพฤติกรรมจริง และต้องมี crosswalk ก่อน aggregate

## สัญญารูปแบบ

ใช้ LDS **0.9.7 / color-srgb-10** เป็นฐาน ไม่สร้างชุดสีใหม่ Foundation ใช้ aliases light/dark จากไฟล์ที่ตรวจแล้ว ส่วนหมวดใช้ categorical fill **และ ink** คู่กับ label และรูปทรงคงที่:

| หมวด | Categorical series | รูปทรง |
|---|---|---|
| Land | `04` | diamond |
| Location | `07` | hexagon |
| Living | `01` | circle |

`--catalog-pillar-fill` / `--catalog-pillar-ink` รับค่าจาก series ที่ตรงธีม รูปทรงเป็น data cue ไม่ใช่ functional icon และไม่สื่อว่าข้อมูลยืนยันแล้ว บน atmosphere ต้อง pin **`measure.deep`** (`--ldm-atmosphere-gradient-measure-deep`) ซึ่งใช้ recipe เดียวกันทั้งสองธีม พร้อม on-deep foreground และ inverse primary action ไม่ใช้ bare `measure` ที่อาจ resolve เป็นพื้นอ่อน และไม่วาง gradient หลังข้อมูล

Functional icons ใช้ local **Google Material Symbols Rounded, FILL 0 / wght 300 / GRAD 0** จาก subset ที่ตรวจแล้วทุก state; opsz ตรง asset และขนาดใช้งาน คงโลโก้แบรนด์/โซเชียลจริงและ accessible name รูปทรงหมวดไม่ต้องปลอมเป็น Google icon ห้าม decorative brackets/colored left rails และต้องรักษา focus ที่มองเห็นได้

Navbar บทความใช้ implementation ร่วมกับเว็บไซต์และรักษาเส้นทางไทย–อังกฤษ Theme ที่ระบุชัดใน query มาก่อนค่าที่บันทึกไว้และค่าระบบ; `auto` ใน shared controller หมายถึง `system` มี fixtures ตรวจ explicit preference, fallback และกรณี storage ใช้ไม่ได้ คงตัว bootstrap ก่อนแสดงหน้าเพื่อลดการแสดงธีมผิดระหว่างเริ่มต้น

## ขั้นตอนสำหรับ intern

1. **ตรึงขอบเขตและฐาน** ตรวจ branch, dirty files, release และ handoff JSON parity; ห้ามเขียนทับ source facts หรือ generated files ด้วยมือ เก็บรายการไฟล์ที่อนุมัติ
2. **ต่อ tokens และ layout** ใช้ renderer ร่วมสำหรับ initial/hydrated HTML; stylesheet layout ใหม่ตามหลัง catalog CSS คง `data-catalog-*` hooks และ DOM order นับกลุ่มย่อยจากการ์ดที่มองเห็นจริง โดยไม่เปลี่ยน runtime motion เดิม
3. **ประกอบบทความ** ใช้ shared template, snapshot-first และ captions ที่ตรงภาพ; route เดิม, source notes ที่เริ่มปิด, map action และ backlink เดิม; previous/next ตามลำดับ catalog และ related จาก subgroup/group ที่มีจริง
4. **เพิ่ม progressive enhancement เท่าที่จำเป็น** สารบัญเป็น native links; progress ไม่แสดงค่าปลอมก่อนทำงาน; sources, map, pager และ share links ยังใช้ได้เมื่อไม่มี JS การอ่านเนื้อหาไม่รอ client fetch
5. **สร้างและตรวจ** บน Node 20+ รัน `npm ci`, `npm run build`, `npm run check`, `git diff --check` ตรวจ deterministic output, semantic JSON parity, 43 records/86 pages, QR decode, sources/credits, icon/font assets และการเปลี่ยนชื่อ URL ตาม content hash
6. **ตรวจหน้าจอจริง** TH/EN × light/dark × narrow/desktop: Examples/Explore, filters/empty state, counts, expanded card, article facts/sources/rail/pager/related/footer; ตรวจหัวข้อเบียดและ overflow ทดสอบ keyboard, touch, reduced motion และ JS-disabled แยกจาก static checks
7. **ตรวจ SEO/agent access** initial HTML มีเนื้อหาและ native links; canonical/hreflang/back anchors และ identity-only JSON-LD ตรง locale; public catalog/article JSON, sitemap และ robots สอดคล้องกัน ไม่เพิ่มข้ออ้าง ranking หรือ AI citation และไม่เปลี่ยนนโยบาย crawling/training โดยพลการ
8. **review และ release** ตรึงไฟล์ที่ตรวจแล้ว เปิด PR และตรวจ CI ของ exact head ก่อน merge ที่ได้รับอนุญาต พิสูจน์ reviewed/merged tree parity รอ Pages terminal success แล้วสร้างรายการ URL จาก manifest รอบใหม่ ตรวจ QR และ active HTML/JS/CSS/font/image/JSON ด้วย final URL, 2xx, MIME, bytes และ SHA-256 เก็บ receipt ใหม่ ไม่ใช้ผลรอบก่อนแทน

## ผลตรวจในเครื่องและขั้นตอนเผยแพร่ที่ยังรอ

หลักฐานอยู่ในชุดภายนอก `citymeter_claude_handoff_2026-10-11` ไม่ใช่ไฟล์ที่จำเป็นต้องเปิดเผยใน public website; JSON คู่เอกสารระบุ SHA-256 ของ log และภาพที่อ้าง

| ผลตรวจ | หลักฐานและขอบเขต |
|---|---|
| Build และ validators | `release/final-npm-check.log` ผ่าน: 151 outputs, 43 records, 86 บทความ, 288 catalog checks; QR ทั้ง 43 ปลายทาง decode ตรง |
| Source และ facts | Records/stories ตรงฐานและ handoff; concise projection ผ่าน fingerprint 86 กรณี ไม่มีการแก้ข้อเท็จจริงต้นฉบับ |
| Runtime | Catalog 18 fixtures, article 14 fixtures, theme 8 fixtures ผ่าน; integration ผ่าน authored/generated navbar 28+28, compiled theme 12 และ subgroup mutation 9 กรณี; `src/runtime/catalog.js` เหมือนฐานทุก byte |
| DOM ที่ render จริง | `qa/article-rendered-344-cases.json`: 43 × TH/EN × light/dark × 390/1710 รวม 344 กรณีไม่ซ้ำ ไม่พบ horizontal overflow หรือ heading หลุดกรอบ ทุกหน้ามี H1/main อย่างละหนึ่ง, fonts loaded, sources เริ่มปิด และภาพใช้ contain |
| Catalog matrix | `qa/catalog-rendered-8-cases.json`: TH/EN × light/dark × 390/1710 ผ่านทั้ง 8 กรณี มี 43 records ไม่พบหน้าล้นหรือหัวข้อหลุดกรอบ; 1 lane บนจอแคบ / 3 lanes บนจอกว้าง |
| ตรวจภาพตัวแทน | Root ตรวจภาพบทความและส่วน catalog ที่เปลี่ยน มีภาพ `article-th-dark-desktop.png`, `catalog-examples-dark-desktop.png`, `catalog-explore-light-desktop.png` ใน `qa/`; ผล DOM 344 กรณีไม่ใช่การตรวจภาพด้วยสายตา 344 ภาพ |
| Interaction และ zoom | `release/browser-qa.json` บันทึกการค้นหา Grocery/จำนวนกลุ่มย่อย, card/source disclosure, TOC, เปลี่ยนภาษา, menu และ theme query; native macOS Chrome 200% ยืนยันผ่าน AX, CSS width 855 / DPR 4 เฉพาะ TH dark catalog expanded Grocery และ TH light RoadDNA hero ไม่พบหน้าล้น คืน zoom 100% แล้ว ไม่ขยายผลเป็นทุกหน้า |
| LDS coverage | Package integrity ผ่าน 9,768 checks; **artifact static scan ยัง FAIL** จาก literals ใน immutable historical CSS และ compositing functions; token-layer scan ยัง FAIL จาก rgba elevation ของ handoff มี scoped review ว่าเป็น neutral UI shadows, aliases ใหม่/measure.deep ตรวจกับ canonical tokens และภาพสองธีมแล้ว ภาพ analytical ไม่เปลี่ยนสี อ้างอิง `qa/ds-scope-review.json`; ไม่รับรองทั้งเว็บ |
| No-JS และ SEO | Local validators ตรวจ initial HTML, native links/disclosures, source/credit/QR/share และ localized discovery contracts ผ่าน; สถานะ `source_verified_browser_not_assessed` เพราะยังไม่ได้ทำ browser session รอบนี้ที่ปิด JavaScript แยกต่างหาก |
| CI / Pages / เว็บจริง | **Pending**: ต้องมี exact reviewed head/tree, CI, terminal Pages success และ manifest-driven URL/MIME/byte/hash attestation ใน release receipt ใหม่ |

การตรวจ package, hashes และ fixture ไม่แทนการตรวจภาพจริง และผลในเครื่องไม่รับรองว่า public URL ได้รับรุ่นนี้แล้ว

การทดสอบ **physical iPhone, exact 130% Thai zoom, complete keyboard/native assistive-technology audit** ที่ยังไม่ทำยังคงเปิดอยู่ ไม่ยกระดับผลเก่าให้เป็นผลของ layout ใหม่นี้ และไม่อ้าง full-site LDS certification การ migrate มีขอบเขตตามตารางด้านบน
