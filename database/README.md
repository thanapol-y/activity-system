# Database - Activity Registration System

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | คำอธิบาย |
|------|----------|
| `schema.sql` | สร้างฐานข้อมูล + ตารางทั้งหมด (11 ตาราง) |
| `insert_data.sql` | ข้อมูลตัวอย่างสำหรับทดสอบระบบ |

---

## วิธีติดตั้ง

### ขั้นตอนที่ 1: สร้างฐานข้อมูลและตาราง

```bash
mysql -u root -p < schema.sql
```

หรือเปิด MySQL Workbench แล้ว import ไฟล์ `schema.sql`

### ขั้นตอนที่ 2: เพิ่มข้อมูลตัวอย่าง

```bash
mysql -u root -p activity_system < insert_data.sql
```

หรือเปิด MySQL Workbench แล้ว import ไฟล์ `insert_data.sql`

> **หมายเหตุ:** ต้องรัน `schema.sql` ก่อนเสมอ เพราะ `insert_data.sql` อ้างอิง foreign key

---

## โครงสร้างตาราง (11 ตาราง)

```
faculty            คณะ
 └── branch        สาขาวิชา (FK → faculty)

department         งาน/ฝ่าย

activity_type      ประเภทกิจกรรม

admin              ผู้ดูแลระบบ
dean               รองคณบดี (FK → department)
activity_head      หัวหน้ากิจกรรม (FK → department)
club               สโมสรนักศึกษา (FK → faculty, branch)
student            นักศึกษา (FK → faculty, branch)

activity           กิจกรรม (FK → activity_type, dean, activity_head)
 ├── registration  การลงทะเบียน (FK → student, activity)
 └── check_in      การเช็คอิน (FK → student, activity, club)
```

---

## บัญชีทดสอบ

**รหัสผ่านทุกบัญชี: `password`**

### Admin
| ID | ชื่อ | Email |
|----|------|-------|
| admin001 | ผู้ดูแลระบบ | admin@rmutp.ac.th |

### Dean (รองคณบดี)
| ID | ชื่อ | Email |
|----|------|-------|
| dean001 | ดร.ศรีสุดา อินทมาศ | srisuda.i@rmutp.ac.th |

### Activity Head (หัวหน้ากิจกรรม)
| ID | ชื่อ | Email |
|----|------|-------|
| head001 | นางลาวัลย์ สายสุวรรณ | Lawan.s@rmutp.ac.th |
| head002 | อาจารย์คัมภีร์ เนตรอัมพร | khampee.n@rmutp.ac.th |
| head003 | อาจารย์ศราวุธ แดงมาก | sravudh.d@rmutp.ac.th |

### Club (สโมสร)
| ID | ชื่อ | Email |
|----|------|-------|
| club001 | นายสมพงษ์ ขยัน | sompong@rmutp.ac.th |
| club002 | นายธนพล ดีมาก | thanapol@rmutp.ac.th |
| club003 | นางสาวชุติมา สวยงาม | chutima@rmutp.ac.th |
| club004 | นางสาวสมศรี มานะ | somsri@rmutp.ac.th |

### Student (นักศึกษา)
| ID | ชื่อ | Email |
|----|------|-------|
| 076760305034-9 | นายธนาพล อยู่ยืน | THANAPOL-Y@rmutp.ac.th |
| 076760305001-8 | นายสุขุม พวงแสงเพ็ญ | sukhum-po@rmutp.ac.th |
| 076760305040-6 | นายธีรชาติ คุณละ | theerachart-k@rmutp.ac.th |
| 076760305012-5 | นายธนวุฒิ แก้วช่วย | thanawut-ka@rmutp.ac.th |
| 076760305011-7 | นายธนวัฒน์ อิ่มเพชร | thanawat-im@rmutp.ac.th |
| 076760305018-2 | นายกรวิชญ์ ยันตรีสิงห์ | korravit-y@rmutp.ac.th |

---

## กิจกรรมตัวอย่าง (3 กิจกรรม)

| ID | ชื่อ | วันที่ | สถานที่ | ความจุ | หัวหน้า | สถานะ |
|----|------|--------|---------|--------|---------|-------|
| Act001 | ค่ายอบรมผู้นำนักศึกษา | 20 ม.ค. 2569 | R101 | 100 | head001 | อนุมัติ |
| Act002 | กีฬาสีภายใน | 3 ก.พ. 2569 | โถงใต้ตึกอาคารพร้อมมงคล | 2,000 | head002 | อนุมัติ |
| Act003 | วันท่องเที่ยวแห่งชาติ | 4 มี.ค. 2569 | R301 | 20 | head003 | อนุมัติ |

---

## สรุปข้อมูลตัวอย่าง

| ตาราง | จำนวน |
|-------|-------|
| คณะ (faculty) | 1 |
| สาขา (branch) | 6 |
| งาน/ฝ่าย (department) | 4 |
| ประเภทกิจกรรม (activity_type) | 5 |
| ผู้ดูแลระบบ (admin) | 1 |
| รองคณบดี (dean) | 1 |
| หัวหน้ากิจกรรม (activity_head) | 3 |
| สโมสร (club) | 4 |
| นักศึกษา (student) | 6 |
| กิจกรรม (activity) | 3 |
| การลงทะเบียน (registration) | 12 |
| การเช็คอิน (check_in) | 9 |
| **รวม** | **51 records** |

---

## หากต้องการรีเซ็ตฐานข้อมูล

```sql
DROP DATABASE IF EXISTS activity_system;
```

แล้วรัน `schema.sql` และ `insert_data.sql` ใหม่
