# CityMETER — ข้อเสนอเมนูเลือกข้อมูล

**สถานะ:** ข้อเสนอการออกแบบและต้นแบบภายใน วันที่ 10 ตุลาคม 2026 ยังไม่ได้ติดตั้งในหน้าแผนที่จริง

เปลี่ยนเมนูพับยาวเป็นหน้าต่างเลือกข้อมูลที่ค้นหาได้ มี Land / Location / Living เป็นตัวกรอง และแสดงหมวดย่อยเป็นหัวข้อในรายการเดียว ผู้ใช้เห็นชื่อเต็ม เปรียบเทียบความหมาย และเลือกข้อมูลได้โดยไม่ต้องเปิดเมนูหลายชั้น

เอกสารใน repo นี้ใช้ [ข้อเสนอสำหรับ agent/ทีมพัฒนา](dataset-switcher.json) และอ่านข้อมูลหมวดจาก [catalog ต้นทาง](../src/catalog.json) สี UI จาก [LDS 0.9.7 audience CSS](../assets/landometer-ds/v0.9.7/color-srgb-10.production.css) ส่วนต้นแบบ HTML และบันทึกตรวจ taxonomy อยู่ในชุด handoff ที่ส่งให้เจ้าของงาน มี 43 รายการ: Land 13, Location 16, Living 14 รวมคลังเหตุการณ์ 2 รายการ โดยไม่นำ Business Dynamics ที่ยังซ่อนอยู่มาเปิดเผย

## แนวทางที่คงไว้และปรับให้ทันปัจจุบัน

คงหลักจาก audit 24 กรกฎาคม §§5–6: หมวดหลัก → หมวดย่อยตามความหมาย → A–Z ตามชื่ออังกฤษปัจจุบันภายในหมวดย่อย ทั้งสองภาษาเรียงตรงกัน ยกเว้นน้ำท่วมที่เรียงตามช่วงของข้อมูล ไม่ยกคำแนะนำเก่าให้เปิด Business Dynamics จำนวนรายการเก่า หรือ LDS รุ่นเก่ามาเป็นข้อกำหนดปัจจุบัน

หมวดย่อยทั้งหมดเป็นหัวข้ออ่านในรายการเดียว ไม่ใช่เมนูพับเพิ่มอีกชั้น เหตุการณ์และประกาศแยกจากการเดินทาง เพราะ City Events & Notices มีขอบเขตกว้างกว่าจราจร การคลังภาครัฐและท้องถิ่นรวมงบประมาณระดับรัฐกับรายได้ อปท. โดยไม่เรียกทั้งหมดว่า local government. Locale Insights และศาสนสถานอยู่ในบริบทพื้นที่ โดยไม่อนุมานความเชื่อหรือพฤติกรรมของผู้อยู่อาศัย

## โครงหน้าต่าง

```text
เลือกข้อมูล / Choose data                           ปิด / Close
ค้นชื่อข้อมูล ไทยหรืออังกฤษ …                        ล้าง / Clear
ทั้งหมด 43      Land 13      Location 16      Living 14
พบ 43 รายการ / 43 results
Land · อาคารและภูมิประเทศ
  อาคาร: ขอบเขต ความสูง และพื้นที่ใช้สอยโดยประมาณ
  [ดูสรุป / Preview]                 [เปิดข้อมูล / Open data]
  ภูมิประเทศและระดับความสูง · มุมมอง 3D
Location · …
Living · น้ำท่วม
  ย้อนหลัง → ตรวจพบ → คาดการณ์ DWR → คาดการณ์ Google
Living · บันทึกเหตุการณ์ที่ผ่านมา
  หาดใหญ่ 24–27 พ.ย. 2568; QuakeSafe
```

ต้นแบบมีปุ่มดูสรุปที่เปลี่ยนเฉพาะข้อมูลสรุปบนหน้า ส่วนลิงก์ “เปิดข้อมูล” เปิด URL จริงในแท็บใหม่ ไม่มีแผนที่จำลอง ไม่มีการเรียกข้อมูลหรือสร้างสิทธิ์การใช้งาน เมื่อผูกเข้ากับแผนที่จริง ให้ปุ่มเลือกรายการใช้ตัวจัดการเปลี่ยน dataset ที่มีอยู่ แยก state ที่กำลังค้นหาจาก dataset ที่แผนที่ใช้งานอยู่

## การค้นหาและการเลือก

- เปิดหน้าต่างแล้วโฟกัสช่องค้นหา ปิดด้วย Escape หรือปุ่มปิดแล้วคืนโฟกัสปุ่มเดิม การเปิด ปิด ค้น และเปลี่ยนหมวดไม่เปลี่ยนแผนที่
- ขณะยังไม่พิมพ์ ใช้ตัวกรองหมวดที่เลือกไว้ เมื่อพิมพ์ ค้นทั้ง 43 รายการและแสดง “ค้นทุกหมวด” ปิดตัวกรองหมวดชั่วคราว ล้างคำค้นแล้วคืนหมวดเดิม เพื่อไม่ให้ค้นชื่อที่มีอยู่แล้วถูกซ่อนเงียบ ๆ
- ค้นชื่อไทย อังกฤษ รหัส dataset และ aliases ที่อนุมัติ รวมชื่อหมวด/หมวดย่อย คงอักขระไทยและวรรณยุกต์ ใช้ NFKC กับ case-insensitive; หลายคำต้องตรงทุกคำ ไม่ต้องเรียก AI หรือ API เพื่อค้น 43 ชื่อ
- รักษาการแบ่งหมวดและลำดับ lifecycle ระหว่างผลค้น ไม่ทำอันดับค้นที่ย้ายน้ำท่วมคาดการณ์มาปนข้อมูลตรวจพบ
- ชื่อไม่ตรงคำค้น: บอก “ไม่พบชื่อตรงคำค้น” และให้ล้างคำค้น ไม่บอกว่าฐานข้อมูลว่างหรือไม่มีข้อมูลในพื้นที่
- คงชื่อเต็มจาก catalog ในต้นแบบ เพื่อทดสอบไทย–อังกฤษจริง ไม่ตัดชื่อผู้ผลิต ช่วงคาดการณ์ หรือวันที่เหตุการณ์เพื่อให้บรรทัดสั้น

## หมวดและรายการครบ 43

### Land · 13 รายการ

| หมวดย่อย TH / EN | ชื่อรายการปัจจุบัน (เรียงแล้ว) |
|---|---|
| อาคารและภูมิประเทศ / Built form & terrain | อาคาร: ขอบเขต ความสูง และพื้นที่ใช้สอยโดยประมาณ / Buildings: Footprints, Height & Estimated Floor Area<br>ภูมิประเทศและระดับความสูง / Terrain & Elevation |
| ที่ดินและการพัฒนา / Land & development | โครงการจัดสรรที่ดินจดทะเบียน / Registered Housing Estates |
| การวางแผนและข้อกำหนด / Planning & regulation | โครงการและรายงาน EIA / EIA Projects & Reports |
| การใช้ที่ดิน / Land use | เกษตรกรรม: พื้นที่เพาะปลูกและผลผลิต (หมื่นไร่) / Agriculture: Crop Area & Output (10,000 Rai) |
| ตลาดที่ดิน / Land market | ราคาประเมินที่ดินและโฉนด / Land Appraisal & Title Deeds<br>ราคาประกาศขายที่ดิน / Land Listing Prices |
| ตลาดที่อยู่อาศัย / Residential market | ค่าเช่าอะพาร์ตเมนต์ / Apartment Rent<br>ราคาประเมินคอนโดมิเนียม / Condo Appraisal Prices<br>ราคาประกาศขายคอนโดมิเนียม / Condo Listing Prices<br>ราคาประกาศขายบ้านเดี่ยว / Detached Listing Prices<br>ราคาประกาศขายทาวน์เฮาส์ / Townhouse Listing Prices |
| ข้อมูลประกอบการลงทุน / Investment insight | ค่าเช่าและผลตอบแทนคอนโดมิเนียม (RentWise) / Condo Rent & Yield (RentWise) |

### Location · 16 รายการ

| หมวดย่อย TH / EN | ชื่อรายการปัจจุบัน (เรียงแล้ว) |
|---|---|
| ทะเบียนธุรกิจ / Business registry | บริษัทจดทะเบียน: สถานะและทุน / Registered Companies: Status & Capital |
| กิจกรรมธุรกิจและอุตสาหกรรม / Business activity | โรงงาน แรงงาน และการลงทุน / Factories, Workers & Investment |
| อสังหาริมทรัพย์เชิงพาณิชย์ / Commercial property | อาคารสำนักงานและค่าเช่า / Office Buildings & Rent |
| เครือข่ายบริการทางการเงิน / Financial services | เครือข่ายสาขาและสำนักงาน Non-bank / Non-bank Branch & Office Networks |
| อาหารและค้าปลีก / Food & retail | ร้านอาหาร: ความหนาแน่น คะแนนรีวิว และระดับราคา / Restaurants: Density, Ratings & Price<br>ร้านค้าปลีกและค้าส่ง / Retail & Wholesale Networks<br>ศูนย์การค้า ตลาด และพื้นที่ค้าปลีก / Shopping Centres, Markets & Retail Sites |
| การท่องเที่ยวและที่พัก / Tourism & hospitality | โรงแรม: จำนวนห้องพัก ราคา และฤดูกาล / Hotel Supply, Rates & Seasonality<br>ความต้องการท่องเที่ยว: จำนวนนักท่องเที่ยวและค่าใช้จ่าย / Tourism Demand: Visitors & Spending |
| การเดินทางและการเข้าถึง / Mobility | สถานีบริการเชื้อเพลิง: จำนวน ความหนาแน่น และประเภทเชื้อเพลิง / Fuel Stations: Count, Density & Fuel Types<br>รถยนต์จดทะเบียน / Registered Cars<br>รูปแบบโครงข่ายถนน / Road Network Archetypes<br>การจราจร: ความติดขัดและความเร็ว / Traffic: Congestion & Speed |
| เหตุการณ์และประกาศ / Events & notices | เหตุการณ์และประกาศในพื้นที่ / City Events & Notices |
| บริบทพื้นที่และสถานที่ชุมชน / Area & community context | Locale Insights: บริบทย่าน / Locale Insights<br>ศาสนสถานในพื้นที่ / Places of Worship |

### Living · 14 รายการ

| หมวดย่อย TH / EN | ชื่อรายการปัจจุบัน (เรียงแล้ว) |
|---|---|
| ผู้คนและประชากร / People | ประชากรตามอายุและเพศ / Population by Age & Sex |
| การศึกษา / Education | โรงเรียน นักเรียน และครู / Schools, Students & Teachers |
| การคลังภาครัฐและท้องถิ่น / Public finance | งบประมาณและการเบิกจ่ายภาครัฐ / Government Budget & Disbursement<br>รายได้องค์กรปกครองส่วนท้องถิ่น / Municipal Revenue |
| บริการภาครัฐ / Public service | หน่วยงานรัฐและบุคลากร / Government Agencies & Workforce |
| น้ำท่วม / Flood | น้ำท่วมซ้ำซาก / Flood: Recurrent<br>น้ำท่วมที่ตรวจพบล่าสุด / Flood: Latest Observed<br>คาดการณ์ความลึกน้ำท่วมโดยกรมทรัพยากรน้ำ / Flood: Forecast Depth by DWR<br>น้ำท่วมฉับพลัน: ความเสี่ยง 24 ชั่วโมงโดย Google / Flood: Flash Flood: 24-hour Risk by Google |
| ภัยและสัญญาณเฝ้าระวังอื่น / Other hazards | เครือข่ายเซนเซอร์แผ่นดินไหว / Earthquake Sensor Network<br>การติดตามสถานการณ์ไฟ / Fire Monitoring |
| ผลกระทบจากภัยหลายประเภท / Multi-hazard | ผลกระทบจากสาธารณภัยในอดีต / Disaster: Historical Impacts |
| บันทึกเหตุการณ์ที่ผ่านมา / Event archive | รายงานน้ำท่วมหาดใหญ่ 24–27 พ.ย. 2568 / Hat Yai Flood Reports — 24–27 Nov 2025<br>QuakeSafe: สถานะการตรวจสอบอาคาร / QuakeSafe: Building Inspection Status |

## ความหมายที่ต้องเห็นก่อนเลือก

| รายการ | ป้ายช่วยแยก | ข้อควรอ่าน |
|---|---|
| อาคาร: ขอบเขต ความสูง และพื้นที่ใช้สอยโดยประมาณ | มีค่าประมาณ / Includes estimates | Building height, floor count and floor area may include estimates. |
| ภูมิประเทศและระดับความสูง | มุมมอง 3D / 3D view | DEM coverage, vertical reference and licence vary by model; a terrain viewer is not an approved flood-risk assessment. |
| สถานีบริการเชื้อเพลิง: จำนวน ความหนาแน่น และประเภทเชื้อเพลิง | จำนวนและประเภทเชื้อเพลิง / Count & fuel types | Current titles do not promise every station is operational or the latest target cleaning has shipped. |
| รถยนต์จดทะเบียน | ข้อมูลทะเบียน / Registration | Registration measures are not the complete vehicle fleet or observed road traffic. |
| รูปแบบโครงข่ายถนน | รูปแบบโครงข่าย / Network pattern | Network pattern is not measured traffic. |
| Locale Insights: บริบทย่าน | บริบทเพื่อศึกษาต่อ / Context for further study | Contextual prior only; not official population, behaviour, eligibility, statutory boundaries or risk. Crosswalk locale_id before aggregation. |
| น้ำท่วมซ้ำซาก | ย้อนหลัง / Historical | Historic recurrence is not a present flood observation. |
| น้ำท่วมที่ตรวจพบล่าสุด | ตรวจพบ / Observed | Latest available observation is not a guarantee of current conditions; read acquisition time. |
| คาดการณ์ความลึกน้ำท่วมโดยกรมทรัพยากรน้ำ | คาดการณ์ความลึก · DWR / Forecast depth · DWR | A modelled depth forecast is not a measured water level. |
| น้ำท่วมฉับพลัน: ความเสี่ยง 24 ชั่วโมงโดย Google | คาดการณ์ 24 ชม. · Google / 24-hour forecast · Google | Flash-flood risk is not interchangeable with DWR modelled depth; validity must be read from the current view. |
| ผลกระทบจากสาธารณภัยในอดีต | ผลกระทบย้อนหลัง / Historical impacts | Recorded impacts do not establish future hazard probability. |
| รายงานน้ำท่วมหาดใหญ่ 24–27 พ.ย. 2568 | บันทึก 24–27 พ.ย. 2568 / Archive · 24–27 Nov 2025 | A dated event archive, not a live flood status. |
| QuakeSafe: สถานะการตรวจสอบอาคาร | บันทึกการตรวจอาคาร / Inspection archive | Inspection status is not a safety certificate or a live earthquake sensor. |

การจราจรที่แสดงความเร็ว/ความติดขัด กับ City Events & Notices เป็นคนละข้อมูล ป้าย `latest` หมายถึงช่วงล่าสุดที่มีให้ดู ไม่แปลว่า real-time โดยอัตโนมัติ วันที่ทบทวน catalog ไม่ใช่วันที่สังเกตการณ์ ไม่สร้างค่าเวลาทดแทนช่องที่ไม่มีหลักฐาน

## ไอคอนและภาพลักษณ์

ใช้ LDS 0.9.7, Material Symbols Rounded แบบ FILL=0, wght=300, GRAD=0 เมื่อมี glyph และ semantic use ที่อนุมัติแล้ว ป้ายข้อความเป็นแกนหลัก ปุ่มและรายการที่เลือกใช้พื้นกลางกับข้อความแสดงสถานะ ไม่เพิ่มเส้นสีด้านซ้าย ไม่เพิ่มวงเล็บตกแต่ง และไม่เปลี่ยนไอคอนเป็น filled เมื่อเลือก

ชุด navigation ที่ตรวจได้มี open_in_new, menu, close, light_mode, dark_mode, contrast และ groups แต่ไม่มีชุดไอคอนทุก domain ที่ข้อเสนอนี้ต้องใช้ จึงใช้ข้อความในต้นแบบทั้งหมด การที่ MUI มีไอคอน factory/terrain อยู่ใน dependency ไม่ได้พิสูจน์ว่าเป็น asset ที่อนุมัติ รุ่น production ต้องผูก glyph กับไฟล์ hash ใบอนุญาต และ role ก่อน หรือคงข้อความ fallback

| รหัส family ที่เสนอ | ไอคอน candidate | สถานะ |
|---|---|
| subgroup.built-form-terrain | landscape | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.land-development | domain | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.planning-regulation | rule | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.land-use | agriculture | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.land-market | sell | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.residential-market | home | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.investment-insight | query_stats | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.business-registry | business | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.business-activity | factory | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.commercial-property | apartment | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.financial-services | account_balance | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.food-retail | storefront | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.tourism-hospitality | travel_explore | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.mobility | route | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.events-notices | event_note | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.area-community-context | location_on | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.people | groups | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.education | school | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.public-finance | payments | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.public-service | account_balance | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.flood | water | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.other-hazards | monitoring | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.multi-hazard | history | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |
| subgroup.event-archive | inventory_2 | เสนอเท่านั้น ยังไม่อนุมัติสำหรับ role นี้ |

ต้นแบบฝังฟอนต์จากแพ็กเกจ LDS 0.9.7 พร้อมข้อความใบอนุญาต ใช้สี foundation ที่ระบุใน `presentation.foundationTokens` ของ [ข้อเสนอ JSON](dataset-switcher.json) ซึ่งตรงกับ LDS 0.9.7 audience CSS ไม่มี data color ที่ถูกสร้างใหม่ ยังต้องตรวจภาพจริงที่ 320 / 390 / 1280 px และ text zoom 200% ทั้งไทย–อังกฤษก่อนรับรอง

## คีย์บอร์ด สัมผัส และเทคโนโลยีช่วยเหลือ

- ใช้ native `<dialog>` แบบ modal มีชื่อชัดเจน ช่องค้นหา label จริง หัวข้อ และรายการ `<ul><li>` ภายใน ไม่ใส่ role menu/tree/listbox ให้รายการลิงก์ธรรมดา
- Tab / Shift+Tab เดินตามปุ่มและลิงก์; Enter ใช้งานสิ่งที่โฟกัส; Escape ปิด; ไม่ดักลูกศรให้เป็น combobox โดยไม่ได้ทำสัญญา keyboard ของ combobox ครบ
- result count ประกาศผ่าน `role=status` โดยไม่ย้ายโฟกัส; ปุ่มกรองใช้ `aria-pressed`; ปุ่มดูสรุประบุ dataset เต็ม; ลิงก์บอกว่าเปิดแท็บใหม่
- พื้นที่กดอย่างน้อย 44×44 CSS px ชื่อและคำเตือน wrap ตามความยาว ไม่ใช้ ellipsis กับ provider/วันที่/forecast horizon; focus outline ยังเห็นชัด
- มือถือใช้หนึ่งคอลัมน์ ภายในหน้าต่างมีพื้นที่เลื่อนผลลัพธ์เดียว แถบค้นหาและปิดเข้าถึงได้ ใช้ dvh ให้รองรับแป้นพิมพ์เสมือน

อ้างอิงรูปแบบคีย์บอร์ดและโฟกัส: [WAI-ARIA Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) และ [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) เพื่อเห็นขอบเขตเมื่อจะเปลี่ยนรูปแบบในอนาคต

## สัญญากับหน้าแผนที่และลิงก์

เก็บ `id` / `datasetCode` เดิมและ mapUrl ปัจจุบันทุกตัว รวมพื้นที่ตัวอย่างและหน้า 3D Terrain ต้องใช้หน้า 3D เดิม ห้ามสร้าง URL ทุกตัวใหม่จาก `?d=` จนทำจุดเริ่มต้นที่จัดไว้หาย ภาษาของคำอธิบายเปลี่ยนได้ แต่ไม่ต่อ `lang=en` บนแผนที่ที่ยังไม่มีเนื้อหาอังกฤษจริง

การนำพื้นที่เดิมข้าม dataset ทำได้เฉพาะเมื่อ boundary/coverage เข้ากันได้ ตัวกรองวันที่ รุ่น dataset และหน่วยอาจต่างกัน ต้องล้างหรือ reconcile อย่างชัดเจน ไม่ลาก state เดิมข้ามแล้วทำเหมือนเปรียบเทียบได้ แผนที่ กราฟ แหล่งที่มา และเวลา ต้องสะท้อน dataset ที่ commit แล้วเดียวกัน; เมื่อโหลดล้มเหลวคงภาพก่อนหน้าพร้อมข้อความแก้ไขได้ ไม่ทิ้ง label ใหม่ไว้กับภาพเก่า

Local Decisions เป็นแนวช่วยค้นคำถามของผู้ใช้ในอนาคต ไม่ใช่หมวดหลักที่สี่ และไม่เป็นข้ออ้างให้แสดงปุ่ม export/alert ซึ่งยังไม่ได้ยืนยันความสามารถและสิทธิ์

## ลำดับงานสำหรับ intern / coding agent

1. ผูก current public catalog และ taxonomy เป็นข้อมูลชุดเดียว ตรวจ ID ทั้ง 43, จำนวน 13/16/14 และ exclusion Business Dynamics โดยไม่คัดลอก source code ของแอป private ไป public repo
2. สร้าง chooser component กับ state local และ semantic list ก่อน เมื่อนำไปใช้ในแอปแผนที่ ให้ตรวจ component และ API เปลี่ยน dataset รุ่นปัจจุบันกับผู้ดูแลแอปก่อนผูก state; repository สาธารณะนี้ไม่ได้เก็บ implementation ของแอปแผนที่
3. เพิ่มการค้น TH/EN/alias และทดสอบคำว่า น้ำท่วม, flood, traffic, ภูมิประเทศ, non-bank, คำที่ไม่พบ พร้อมรักษาลำดับ family
4. ผูกการเลือกกับ shared state ของแผนที่เดิม พร้อมทดสอบคำขอล่าช้าและโหลดล้มเหลว; อย่าใช้ผลผ่านต้นแบบนี้แทนการทดสอบ integration
5. ตรวจ keyboard, screen reader, touch, 320/390/1280 px และ zoom200% ทั้งสองภาษา ตรวจชื่อยาวและทุกส่วนเพิ่มใหม่จริง ไม่ใช้ hash/token checks แทนภาพ
6. ก่อนปล่อย เก็บผลทดสอบแยก local prototype / implementation / production และยืนยัน URL ที่เปิดจริง รวม terrain3D และ named-area examples ไม่เผยแพร่ต้นแบบนี้เป็นค่าเริ่มต้น

## เกณฑ์ยอมรับ

- **SW-01** — Open chooser, type น้ำท่วม; five flood-related records appear, including a separately labelled dated Hat Yai archive; clear restores the previous pillar filter.
- **SW-02** — Search flood in Thai mode and น้ำท่วม in English mode; both return the same five IDs, grouped by semantics. Search traffic also finds the retained Traffic Incident alias for Events & Notices, without changing its broader title.
- **SW-03** — Search a no-match string; status says no matching names, offers clear; selected record and map remain unchanged.
- **SW-04** — Open with keyboard, reach search, filters, preview button and real link; Escape returns focus to opener and does not change selection. Focus remains inside modal.
- **SW-05** — Preview DWR forecast, Google flash flood and Hat Yai archive; each keeps provider, horizon or event dates and its limitation. No generic live badge is added.
- **SW-06** — Prototype selecting a preview changes only the local summary; external map opens only through its explicit link. No data API requests, login or permissions are simulated.
- **SW-07** — All 43 IDs appear once; counts 13/16/14; hidden businessDynamics absent in search, list and counts. Two archives count as catalog resources, not new data feeds.
- **SW-08** — At widths 320, 390 and 1280 CSS px, both languages and 200% text zoom: long names wrap, no clipped provider/date, all actions >=44px, no horizontal scroll or coloured selection rail.
- **SW-09** — Curated building/deed 3D or named-area links remain byte-for-byte catalog URLs; terrain opens its 3D URL; language switching does not append an unsupported lang=en to maps.
- **SW-10** — Operational integration only: rapid A→B selection plus delayed A response leaves B selected and painted; failures keep previous valid view and a visible retry; no stale source/period labels.
- **SW-11** — Native screen-reader check reads dialog name, selected state, result count and descriptive external links; no menu/tree/listbox role is applied to this list.
- **SW-12** — Check source date unavailable vs measured zero: prototype says read the available period on the map and never invents a timestamp or completeness claim.

## หลักฐานและข้อจำกัดการตรวจ

- Catalog source: [src/catalog.json](../src/catalog.json) SHA-256 `e9dedd5229a5c82fab1393ecb04414ce82531d51a495d6b3a3ff3639ceda5f26`
- Taxonomy source: `subgroups` และ `records[].subgroup` ใน catalog ต้นทางเดียวกัน; รายการที่ใช้ในข้อเสนอนี้อยู่ใน `pillars` และ `records` ของ [ข้อเสนอ JSON](dataset-switcher.json)
- Historical background: CityMETER public dataset audit วันที่ 24 กรกฎาคม 2026 §§5–6 เป็นเอกสารอ้างอิงที่เจ้าของงานให้มาและไม่ได้รวมใน repository นี้ ใช้เฉพาะแนวจัดกลุ่มที่สรุปไว้ข้างต้นและยังสอดคล้องปัจจุบัน
- LDS base: `lds-0.9.7-landometer-standalone-r1`, SHA-256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`; ตรวจ rule ที่เกี่ยวกับ typography, icons, controls และ foundation tokens สำหรับชิ้นนี้ ไม่อ้างว่าทั้งไซต์ผ่าน LDS
- ต้นแบบใช้ข้อมูลสรุปและข้อจำกัดจาก catalog ปัจจุบัน เก็บ null period เป็นไม่ระบุ ไม่ได้ตรวจการ ingestion หรือทำให้ forecast/การเข้าถึงข้อมูลใหม่พร้อมใช้งาน
- ผลตรวจ browser ของต้นแบบต้องบันทึกแยกจากเว็บ catalog และแอปแผนที่ ระบุภาษา ความกว้าง zoom และ assistive technology ที่ตรวจจริง; เกณฑ์ SW-01–SW-12 ข้างต้นเป็นงานที่ต้องตรวจ ไม่ใช่รายการที่รับรองว่าผ่านแล้ว
- ผล fixture ของ runtime catalog ไม่ใช่ผลทดสอบต้นแบบ chooser นี้ และไม่ใช่ผลทดสอบการตั้งค่า reduced motion ในระบบปฏิบัติการ
