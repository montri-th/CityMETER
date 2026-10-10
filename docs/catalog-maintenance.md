# ดูแล CityMETER catalog และบทความ

ใช้คู่มือนี้กับ `montri-th/CityMETER` และ https://montri-th.github.io/CityMETER/ การแก้เว็บสาธารณะนี้ไม่เปลี่ยนฐานข้อมูล ตัวกรอง หรือความสามารถของแผนที่ที่ landometer.com คู่มือ machine-readable อยู่ข้างกันใน `catalog-maintenance.json`

## แก้ให้ถูกไฟล์

| งาน | แหล่งที่แก้ | ผู้สร้างผลลัพธ์ |
|---|---|---|
| การ์ด ชื่อ หมวด คำค้น ที่มา หน่วย ช่วงเวลา ข้อจำกัด เส้นทาง | `src/catalog.json` | `scripts/lib/catalog-render.mjs` |
| บทความอิสระไทย–อังกฤษ 43 เรื่อง | `src/dataset-stories.json` | `scripts/lib/summary-article.mjs` |
| การค้นหา กลุ่มการ์ด quiet context และ motion | `src/runtime/catalog.js`, `src/styles/catalog.css` | builder |
| หน้าบทความ การแชร์ ธีม | `src/styles/summary.css`, `src/runtime/summary.js` | builder |
| footer และ favicon ร่วมกัน | `scripts/lib/public-shell.mjs`, `src/styles/public-footer.css` | initial HTML, React K6 และบทความ |
| เครดิต | public Landom projection → `data/landom-contributors.json` | `scripts/sync-public-contributors.mjs` |
| ที่มาภาครัฐ/โรงงาน/โรงแรม | `data/government-source-provenance-20261010.json`, `data/factory-hotel-source-provenance-20261010.json` | public evidence ledger |
| ภาพแค็ตตาล็อกใหม่ 6 ชุด/12 ไฟล์ | `data/dataset-preview-assets-20261010.json` | ตรวจตาม hash/ขนาด/บทบาท |
| ภาพประกอบบทความจากหน้าใช้งาน 5 ภาพ | `data/story-snapshot-assets-20261010.json` | ตรวจตาม hash/ขนาด/บทบาท |

ไม่แก้ `index.html`, `en/index.html`, `datasets/`, `en/datasets/`, `data/catalog.json`, `data/dataset-stories.json`, QR หรือ public bundles ด้วยมือ ให้สร้างใหม่ผ่าน `scripts/build-catalog.mjs` เก็บ baseline ที่ตรึง hash และประวัติ release เดิมไว้

## คนใช้เดินทางอย่างไร

ปัจจุบันมี 43 public records: Land 13, Location 16, Living 14 ไม่มี Business Dynamics หรือ mb ใน public discovery สามหมวดเป็นมุมมองคู่กัน ไม่ใช่สูตรผลรวม

การ์ดหลักพาเข้าแผนที่ได้ทันที ปุ่มอ่านบทความเป็นทางเลือกข้างกัน ไม่บังคับอ่านก่อนใช้งาน ช่อง **ข้อมูลนี้ใช้ทำอะไรได้** เป็น native disclosure ที่เริ่มพับไว้ ภายในมีประโยชน์ คำถามที่ข้อมูลช่วยตอบ ลิงก์อ้างอิงข้อเท็จจริง เครดิต และ QR เท่านั้น ไม่มีสถานะทบทวน คำเตือนเรื่องแหล่ง หรือข้อจำกัดบนการ์ดทั้งตอนพับและขยาย โลโก้ GD ใช้ภาพโปร่งใสเดิม ไม่มีพื้นรอง/ย้อมสี และต้องมี lineage กับ GD reference ที่ตรงจริงก่อนแสดง

บทความมีเรื่องอิสระราย dataset จาก `src/dataset-stories.json` เริ่มด้วยพื้นที่หรือสถานการณ์จริง ตัวเลขที่มีหน่วยและช่วงเวลา และคำถามที่คนอยากตอบ ตามด้วยอย่างน้อยสามส่วนที่พาเรื่องไปข้างหน้า ไม่ใช่การนำคำอธิบายการ์ดมาเพิ่มความยาว `record.executiveSummary` ยังเป็นข้อมูลประกอบเดิม ไม่ใช่แหล่งหลักของเรื่องทั้งบทอีกต่อไป

เก็บที่มาและข้อควรรู้ทั้งหมดใน **แหล่งข้อมูลและข้อควรรู้** ที่พับไว้เป็นค่าเริ่มต้น รวม `record.limitation`, reader note และ `story.hiddenNotes` ให้ครบ ส่วน `findingContext` ที่มองเห็นต้องยังบอกสถานที่ วันที่ รุ่น/ช่วงคาดการณ์ หน่วย หรือสถานะว่าเป็นตัวอย่างจากแหล่งภายนอก เพื่อให้ข้อค้นพบอ่านถูกตั้งแต่ต้น ไม่ซ่อนบริบทจนทำให้ตัวเลขดูเป็นเหตุการณ์ปัจจุบัน

ท้ายบทความมีทางเปิดแผนที่ รายชื่อทีม QR การแชร์ และลิงก์กลับ `#dataset-<slug>` ไม่มีขั้นอ่านชั้นที่สาม การแชร์ผ่าน LINE/Facebook/LinkedIn/X เป็นลิงก์ที่ผู้ใช้เลือกเอง; native share/clipboard เป็นส่วนเสริม มี URL ให้เลือกคัดลอกเมื่อ JavaScript หรือ clipboard ใช้ไม่ได้

## ขั้นตอนของ intern

1. **ตรวจหลักฐานและขอบเขต** เปิดหน้าจริงหรือ receipt ที่ตรวจแล้ว จดพื้นที่ ตัวกรอง ช่วงเวลา หน่วย ตัวหารและ source role แยกผู้ผลิต ผู้เผยแพร่ portal และผู้ประมวลผล การเปิด URL ได้ไม่ยืนยันว่า CityMETER ใช้ไฟล์รุ่นนั้น ห้ามนำ private telemetry, contact payload, raw Drive IDs หรือบันทึกภายในใส่ public JSON
2. **เขียนทั้งสองภาษา** แก้ข้อมูลการ์ดใน catalog และเรื่องใน dataset-stories โดย join ด้วย `datasetCode` รักษา `id`, `slug`, `mapUrl` เดิมถ้ายังไม่มีการย้ายเส้นทางที่ตรวจแล้ว เรื่องต้องมี `title`, `place`, `lead`, `findingContext`, `sections`, `action`, `hiddenNotes` และ evidence สาธารณะ; `mapUrl`/`snapshot` เป็นตัวเลือกที่ต้องตรงกับตัวอย่าง อ้างแหล่งภายนอกเป็นลิงก์ในส่วนที่เล่าข้อเท็จจริงนั้น
3. **ตรวจเนื้อหาซ้ำและการตีความ** ให้แต่ละส่วนมีสิ่งใหม่ที่เกี่ยวกับพื้นที่หรือคำถามนั้น หลีกเลี่ยงสี่ส่วนที่วนซ้ำเพียง “จดเวลา–ตั้งคำถาม–ลงพื้นที่–ส่งต่อทีม” ไม่เติมคำเพื่อให้ผ่านความยาว การอ่านประมาณ 3–5 นาทีคำนวณจาก ICU word-like segments ของชื่อเรื่อง lead หัวข้อ ย่อหน้าและ action หาร 170 แล้วปัดใกล้ที่สุด ไม่รวม source disclosure, caption, findingContext หรือ footer และไม่ใช่เวลาที่วัดจากผู้อ่านจริง
4. **ตรวจหมวด ภาพ และเครดิต** คง 13/16/14 และลำดับกลุ่มย่อยเดิม น้ำท่วมเรียงประวัติซ้ำ → ตรวจพบล่าสุด → DWR คาดการณ์ → Google คาดการณ์ ภาพห้าชุดใหม่คือ rentWise, terrain, localeInsights, flood-forecast-depth และ flash-flood-risk เก็บสีข้อมูลและ selected state จริง วัน capture ไม่ใช่วันอัปเดตข้อมูล ถ้าไม่มีภาพจริงให้บอกว่าไม่มี ห้ามสร้างภาพให้ดูเป็นหลักฐาน
5. **รับเครดิตจากแหล่ง public ที่ตรวจแล้ว** ใช้ `npm run sync:contributors` และ review diff; ถ้าใช้ไฟล์จาก public Landom checkout ที่ตรวจแล้ว ใช้ `node scripts/sync-public-contributors.mjs --file <path>` ไม่คัดลอก private registry ปัจจุบัน module joins ครบ 43 รายการ ชื่ออังกฤษที่เจ้าของยืนยันคือ Que (`I0045`: Nattapat Daengkongkaew) และ Nine (`I0038`: Norraphat Rathasamuth) คงบทบาท วันที่ Developing และ consent ตาม canonical เดิม การแก้ชื่อไม่ใช่การอนุญาตเผยแพร่เพิ่ม
6. **สร้างและตรวจรวม** จาก root repository บน Node 20+ รัน `npm ci`, `npm run build`, `npm run check` ตามลำดับ การ check รวม deterministic build, catalog, layout, runtime, 86 summary pages และ public shell; QR ต้องถอดรหัสกลับเป็น `record.mapUrl` ทุกภาพ ก่อน integrated build ใช้ `node scripts/validate-public-shell.mjs --source-only` ได้ แต่ผลนี้ไม่ยืนยัน HTML/React parity
7. **ตรวจจอจริง** TH/EN ที่ 390/1440 CSS px ทั้ง light/dark, จุดเปลี่ยน 768/1100 และ native zoom 200% ตรวจส่วนที่แก้ครบ การ์ดต้องอยู่คนละ lane ตามหมวด จอแคบไม่ซ้อนข้อความ การค้นหาซ่อนกลุ่มว่างได้ reset/same-hash ทำงาน QR ไม่ถูกบัง menu/nav อ่านชัด keyboard/touch/no-JS/reduced motion ใช้งานได้และไม่มี first-tap trap บันทึกเฉพาะภาษา ขนาด ธีม และหน้าที่ตรวจจริง
8. **review และ release** PR ต้องชี้ exact head ที่ผ่าน CI พร้อมภาพและขอบเขตผลตรวจ หลัง merge ที่ได้รับอนุญาต ตรวจ Pages provider/deployed SHA/merge tree และ live bytes/MIME/hash ของ HTML, JSON, เครดิต, ledgers, ภาพ, font/icons, footer และ build manifest แล้วลองเส้นทางผู้ใช้จริง การ push หรือ CI ผ่านเพียงอย่างเดียวไม่ใช่การ deploy สำเร็จ

## ข้อเท็จจริงเรื่องแหล่งที่เพิ่งยืนยัน

- **น้ำท่วมซ้ำซาก:** ทีมยืนยัน GISTDA Disaster Platform Open API แล้ว ช่วง 2011–2024 เป็นปีที่ explorer ให้เลือก; ยังต้องจับคู่ annual assets และวิธีประมวลผล ไม่ใช้ metadata ชุด GD เดิม 2011–2023 แทนไฟล์ทุกปี
- **งบประมาณ:** GFMIS เป็นระบบต้นทางตามคู่มือ PBO/Thaith ช่วงปีงบประมาณ 2015–2025 หน่วยล้านบาท แยกงบหลังปรับ เบิกจ่าย และ PO; รายการที่จับคู่พื้นที่ได้ไม่ใช่งบทั้งประเทศ
- **หน่วยงานและบุคลากร:** แยกกำลังคน ก.พ. ออกจากที่อยู่ ก.พ.ร. และสถานที่ของกรมการปกครอง/กทม. ไฟล์ข้าราชการพลเรือนสามัญ 2023/2024 ไม่มีพิกัดสำหรับกระจายยอดกรมลงทุกสาขา ที่อยู่ไม่ยืนยันการเปิดบริการหรือคุณภาพ
- **โรงงาน:** แหล่งที่ตรงคือชุด “ที่ตั้งประกอบกิจการโรงงาน” ของสำนักงานปลัดกระทรวงอุตสาหกรรม; GD Catalog เป็น discovery host วันที่ลงทะเบียน 4 ส.ค. 2025, data update 8 ก.ค. 2025 และเดือนเมษายน 2025 บนแผนที่เป็นคนละวัน
- **โรงแรม:** TAT ให้ประเภท/ที่ตั้งที่พัก; BMA เผยแพร่ subset โรงแรมสมาชิกสมาคมพร้อมฟิลด์ห้องพัก ไม่ใช่หลักฐานของราคา ฤดูกาล หรือการนำเข้า CityMETER จริง แยก contact/manual/comparison references ออกจาก upstream data

การตอบชื่อแหล่งแล้วไม่ทำให้ gap เรื่อง exact ingestion, coverage, method หรือ licence หายไป ห้ามถามซ้ำว่าใครเป็นผู้ผลิตโดยมองข้ามคำตอบเดิม ให้ตามเฉพาะรุ่นไฟล์และการจับคู่ที่ยังขาด

## รูปแบบและขอบเขต LDS

ใช้ LDS 0.9.7 ฐาน `lds-0.9.7-landometer-standalone-r1` SHA-256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96` สำหรับส่วนที่ปรับ งานนี้คง historical immutable assets และ shell behavior เดิม จึงไม่ใช่ full-site conformance claim

พื้นการ์ด/ค้นหาเป็นกลางทุกสถานะ ไม่มีสีน้ำตาลหรือ beige; สี chip Land/Location/Living ใช้ categorical roles ที่กำหนด การขยายใช้ native details และ finite FLIP พร้อม reduced-motion final state; quiet treatment เป็น pointer-transparent veil ไม่มี blur, scroll lock หรือการดักคลิก ปุ่มและเนื้อหาสำคัญมองเห็นตั้งแต่ initial HTML ไม่ใช้ decorative bracket หรือ colored left rail

เชื่อม **Google Material Symbols Rounded — FILL=0, wght=300, GRAD=0** สำหรับ functional icons ในส่วนเว็บที่ปรับแล้ว โดยใช้ asset ในเครื่องตาม `data/ui-icon-assets-20261010.json`, helper `scripts/lib/ui-icon.mjs`, ตัวแปลง `scripts/lib/ui-icon-migration.mjs` และ `src/styles/ui-icons.css` ไม่พึ่ง font จากเครือข่าย รักษาชื่อปุ่ม focus และสถานะที่อ่านได้ด้วยเทคโนโลยีช่วยเหลือ โลโก้ social และ brand ทางการ รวมถึง portfolio favicon คงเดิมและใช้ authority ของตน การเชื่อมใน source เสร็จแล้ว แต่ผลตรวจภาพจริงและการเผยแพร่ยังต้องอ้าง receipt แยก

Footer มาจาก `publicFooter(lang, assetBase, {kind, mapUrl?, slug?})` ร่วมกันใน initial HTML, React K6 และบทความ คงคำ/ลิงก์แบรนด์จาก reference, depa supporter และเครื่องหมายประกอบเดิม ใช้ favicon ที่ตรวจแล้วในเครื่อง ไม่ใช้ external favicon รุ่นเก่า

Locale Insight เป็น contextual prior เพื่อวางแผน ตรวจพื้นที่และรับฟัง ต้องมี `locale_id` crosswalk ก่อน aggregate ไม่ใช้ยืนยันประชากร สิทธิ ขอบเขตตามกฎหมาย ความเสี่ยง หรือพฤติกรรมจริง Count share ไม่ใช่ส่วนแบ่งยอดขาย; no-data ไม่ใช่ศูนย์; review date ไม่ใช่ ingestion date

## ป้องกันสคริปต์และสไตล์รุ่นเก่าค้างใน browser

Builder เติม `?v=<catalog.contentVersion>-<SHA-256 ของเนื้อหาไฟล์ 12 ตัวแรก>` ให้ URL ของ generated JS/CSS ที่อยู่ใน `versionedPublicAssets` ทั้งหน้า catalog ไทย–อังกฤษและบทความ86หน้า เมื่อ bytes เปลี่ยน URL จะเปลี่ยนแม้ใช้ชื่อไฟล์หรือ contentVersion เดิม จึงไม่เอา HTML ใหม่ไปใช้กับ runtime/style เก่าจาก warm cache

ขอบเขตนี้ครอบคลุม public catalog/enhancer/navbar bundles, catalog/summary runtime และ catalog/summary/shell/navbar/footer/UI-icon styles ที่ระบุใน allowlist ไม่ได้เปลี่ยนชื่อ historical immutable assets หรือเป็นคำรับรองการ purge cache ทั้งเว็บไซต์ ให้รัน builder และตรวจ query เทียบ hash ของ output จริง ห้ามแก้ query ด้วยมือ การตรวจ cache URL เป็นคนละขั้นกับ provider/deployed SHA และ live-byte attestation

## ขอบเขตคำรับรอง

คู่มือนี้บันทึกสัญญาที่เขียนใน source ระหว่างงานรวม ไม่ได้ประกาศว่า final build, browser matrix หรือ deployment รอบนี้ผ่านแล้ว ตัวเลข fixture เดิมใน JSON เป็นประวัติที่ต้องรันใหม่บน final head รูปหน้าจอ/byte hash/VM test ทำหน้าที่ต่างกันและใช้แทนกันไม่ได้ JSON-LD คง identity-only (`@id`, `@type`, `name`, `url`) ส่วนคำอธิบายและข้อจำกัดอยู่ใน HTML/public JSON การมี metadata ไม่รับประกัน search ranking หรือการถูก AI อ้างถึง
