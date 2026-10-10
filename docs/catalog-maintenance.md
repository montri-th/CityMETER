# ดูแลข้อมูล CityMETER บนเว็บสาธารณะ

ใช้คู่มือนี้กับ repository `montri-th/CityMETER` และเว็บ <https://montri-th.github.io/CityMETER/> การแก้คำอธิบายในเว็บนี้ไม่เปลี่ยนฐานข้อมูลหรือความสามารถของแผนที่ที่ landometer.com

## แก้จากแหล่งเดียว

แก้ `src/catalog.json` สำหรับชื่อ คำอธิบาย ที่มา ช่วงเวลา ระดับรายละเอียด ข้อจำกัด และคำค้นไทย–อังกฤษ อย่าแก้ `index.html`, `en/index.html`, `datasets/`, `en/datasets/`, `data/catalog.json` หรือ `assets/*public*r1*` ด้วยมือ เพราะระบบสร้างไฟล์เหล่านี้จากแหล่งเดียวกัน

ปัจจุบันมี 43 รายการ: Land 13, Location 16, Living 14 ใช้สามหมวดเป็นมุมมองคู่กัน ไม่มีสูตรที่ให้หมวดหนึ่งเท่ากับผลรวมของอีกสองหมวด งานเขียนและส่วนแค็ตตาล็อกใหม่ใช้ LDS 0.9.7 ฐาน `lds-0.9.7-landometer-standalone-r1` (SHA-256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`) และ audience CSS `color-srgb-10` ส่วน shell และสื่อเดิมยังเก็บจาก public release ก่อนหน้า จึงไม่ใช่คำรับรองว่าเว็บทั้งหมดผ่านการย้ายรุ่นหรือ conformance

1. **ระบุสิ่งที่จะเปลี่ยนและหลักฐาน** เปิดหน้าข้อมูลจริงและแหล่งสาธารณะที่เกี่ยวข้อง แยกเจ้าของข้อมูล ผู้เผยแพร่ ผู้ให้บริการแผนที่ และแหล่งอ้างอิงที่ยังไม่ยืนยันว่าเป็นไฟล์เดียวกัน จดช่วงเวลา หน่วย ตัวหาร และขอบเขตที่ตรวจได้ อย่าใช้วันที่ทบทวนคำอธิบายแทนวันที่อัปเดตข้อมูล
2. **แก้คำอธิบายให้คนอ่านรู้ว่าจะใช้ตอบอะไร** ใช้ถ้อยคำของทีมที่มีอยู่ก่อน รักษาความหมายและคำที่คนใช้จริง ถ้าข้อมูลยังไม่พอให้ระบุสิ่งที่ยังไม่ทราบ ใช้ WHO เป็นคนที่มีคำถามและเหตุผลที่ต้องตัดสินใจ WHAT เป็นข้อมูลที่มี WHICH เป็นวิธีอื่นที่ตอบคำถามเดียวกัน HOW เป็นคุณค่าที่ช่วยให้ตัดสินใจต่อ ไม่ปนกับขั้นตอนคลิกใช้งาน
3. **ตรวจข้อจำกัดของการตีความ** Location ช่วยอ่านภูมิทัศน์ตลาด เครือข่ายธุรกิจ อุปทาน และตัวแทนของความต้องการ สัดส่วนจากจำนวนสาขาหรือทะเบียนต้องบอกฐานรายการที่ใช้ ไม่เรียกว่า market share ด้านยอดขายหรือรายได้ ความต้องการที่อนุมานยังไม่ใช่ observed demand ส่วน Locale Insight ใช้เป็น contextual prior สำหรับวางแผนและตรวจพื้นที่ ต้องมี crosswalk ก่อน aggregate; ไม่ใช่ประชากรทางการ เกณฑ์สิทธิ ขอบเขตตามกฎหมาย ความเสี่ยง หรือพฤติกรรมที่ยืนยันแล้ว
4. **แก้ทั้งสองภาษาและคำค้น** คง `id`, `slug`, `datasetCode` และ `mapUrl` ถ้าไม่มีการย้ายเส้นทางที่ตรวจแล้ว เพิ่มชื่อที่คนใช้ค้นใน `aliases` ทั้งไทยและอังกฤษ ไม่เพิ่มคำที่อ้างคุณสมบัติหรือผู้เผยแพร่ที่ยังไม่ยืนยัน ภาพใหม่ต้องมีสิทธิและแสดงข้อมูลนั้นจริง ถ้าไม่มีให้ใช้ `preview.available: false` และ `path: null`
5. **เครดิตใช้ public Landom projection** รัน `npm run sync:contributors` เพื่ออ่าน <https://montri-th.github.io/Landom/data/generated/citymeter-contributors.json> ตรวจ diff ของรายชื่อและ module ก่อนใช้ อย่าเดาคนจากชื่อผลงาน อย่าเติมบทบาทหัวหน้า วันที่ หรือความยินยอมจากการพบชื่อในเว็บ ถ้ากำลังปล่อยสอง repo พร้อมกัน ใช้ `node scripts/sync-public-contributors.mjs --file ../Landom/data/generated/citymeter-contributors.json` กับไฟล์ projection ใน public checkout ที่ review แล้วได้
6. **สร้างและตรวจ** ใช้ Node 20 ขึ้นไป ไม่ต้องติดตั้ง dependency รัน `npm run build` แล้ว `npm run check` ทดสอบค้นชื่อใหม่ทั้งสองภาษา ตรวจกรอง Land/Location/Living ล้างคำค้น เปิดรายละเอียดและลิงก์แผนที่ ตรวจว่าหน้าแรกหลังโหลดและหลังเปลี่ยนตัวกรองมีข้อความเดียวกัน
7. **ตรวจหน้าจอจริง** เปิด TH/EN ที่ความกว้างประมาณ 390 และ 1440 px ตรวจชื่อยาว ช่วงเวลา ข้อจำกัด เครดิต และส่วนที่เพิ่มใหม่ ตรวจ keyboard focus, เมนู ภาษา ธีม decision panel, share, reel และ reduced motion ไม่มีข้อความล้น ไม่มีภาพตัวอย่างปลอม และไม่มี decorative bracket หรือ rail สี
8. **ส่ง PR พร้อมผลตรวจ** ระบุปัญหาและผลต่อผู้ใช้ หลักฐานที่เปลี่ยน ภาพ TH/EN บนมือถือ/desktop และผล `npm run check` CI นี้ตรวจคุณภาพเท่านั้น ไม่ deploy จาก PR เก็บไฟล์ public release เก่าไว้เป็นประวัติ ไม่ใช้เอกสาร LDS รุ่นเก่าเป็น authority คู่ขนาน
9. **หลัง merge และ Pages deploy** ตรวจ provider ว่า source คือ `main` ที่ root และ commit ที่ deploy ตรงกับ commit ที่ review แล้ว ตรวจ URL จริงทั้งสองภาษา metadata, `data/catalog.json`, รายการใหม่ และเครดิตสาธารณะ เปรียบเทียบ SHA-256 ของไฟล์ตัวแทนกับ build นี้ อย่าเรียกว่าปล่อยสำเร็จจากการ push อย่างเดียว

## สัญญาของข้อมูลและการสร้างหน้า

- `scripts/lib/catalog-render.mjs` สร้าง HTML ของ catalog/showcase/detail และ minimal identity graph
- `scripts/build-catalog.mjs` ใช้ public baseline ที่ตรึง hash ไว้ สร้าง bundle รุ่นใหม่อย่างตรวจซ้ำได้ และใช้ HTML เดียวกันใน initial page กับ React hydration
- React เดิมยังเป็นเจ้าของ decision panels, share/reel และ shell ส่วน `src/runtime/catalog.js` รับเฉพาะการค้น/กรองของ catalog ไม่ย้าย DOM แย่งกับ React
- `data/catalog.json` เป็น read-only public representation ของคำอธิบายและแหล่งอ้างอิง ไม่ใช่ API ของตัวเลขข้อมูลเมือง และไม่ใช่สัญญาอนุญาตให้ใช้ upstream data
- วันที่ `sourceReview.reviewedAt` คือวันทบทวนแหล่งอ้างอิง ไม่ได้ยืนยัน ingestion, freshness, completeness หรือสิทธิการนำข้อมูลไปใช้ต่อ
- JSON-LD ใช้ identity เท่านั้น: `@id`, `@type`, `name`, `url`; คำอธิบาย ที่มา และข้อจำกัดอยู่ใน HTML และ public JSON อย่าเพิ่ม claim ที่ graph ไม่ได้มีหน้าที่ยืนยัน
- `data/catalog-build.json` แสดง hash ของ input/output และขอบเขตที่เปลี่ยน ไม่ใช่ deployment receipt หรือการรับรองทั้งเว็บไซต์

ถ้าเพิ่มหรือนำรายการออก ให้ปรับ registry count, หมวด, guards และ test cases พร้อมกัน แล้วตรวจว่าลิงก์เก่าที่ควรคงอยู่ยังใช้งานได้ คำตอบว่า “ไม่พบข้อมูล” ต้องไม่กลายเป็นศูนย์ ไม่มีสถานที่ หรือไม่มีใบอนุญาต

ขั้นตอนเดียวกันสำหรับ AI agent อยู่ใน `docs/catalog-maintenance.json`.
