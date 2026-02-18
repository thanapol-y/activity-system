-- =============================================
-- Activity Registration System - ข้อมูลตัวอย่าง
-- =============================================
-- ใช้หลังจากรัน schema.sql แล้ว
-- รหัสผ่านทุกบัญชี: password
-- bcrypt hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- =============================================

USE activity_system;

-- =============================================
-- 1. ตารางอ้างอิง (Lookup Tables)
-- =============================================

-- คณะ
INSERT INTO faculty (Faculty_ID, Faculty_Name) VALUES
('Faculty_01', 'บริหารธุรกิจ');

-- สาขาวิชา
INSERT INTO branch (Branch_ID, Branch_Name, Faculty_ID) VALUES
('Branch_01', 'สาขาบัญชี', 'Faculty_01'),
('Branch_02', 'สาขาการเงิน', 'Faculty_01'),
('Branch_03', 'สาขาการตลาด', 'Faculty_01'),
('Branch_04', 'สาขาการจัดการ', 'Faculty_01'),
('Branch_05', 'สาขาระบบสารสนเทศ', 'Faculty_01'),
('Branch_06', 'สาขาการเป็นผู้ประกอบการ', 'Faculty_01');

-- งาน/ฝ่าย
INSERT INTO department (Department_ID, Department_Name) VALUES
('Department_01', 'รองคณบดีฝ่ายกิจการนักศึกษา'),
('Department_02', 'หัวหน้างานกิจการนักศึกษา'),
('Department_03', 'หัวหน้างานกีฬา'),
('Department_04', 'หัวหน้างานศิลปวัฒนธรรมและงานศิษย์เก่าและชุมชนสัมพันธ์');

-- ประเภทกิจกรรม
INSERT INTO activity_type (Activity_Type_ID, Activity_Type_Name) VALUES
('Activity_Type_01', 'ด้านบำเพ็ญประโยชน์และรักษาสิ่งแวดล้อม'),
('Activity_Type_02', 'ด้านวิชาการและวิชาชีพ'),
('Activity_Type_03', 'ด้านกีฬาและนันทนาการ'),
('Activity_Type_04', 'ด้านอนุรักษ์ศิลปวัฒนธรรม'),
('Activity_Type_05', 'ด้านส่งเสริมคุณธรรม จริยธรรม');

insert into gender (Gender_ID, Gender_Name) values
('Gender_01', 'ชาย'),
('Gender_02', 'หญิง'),
('Gender_03', 'LGBTQ+');

-- =============================================
-- 2. ผู้ใช้งาน (Users)
-- =============================================

-- Admin (ผู้ดูแลระบบ)
INSERT INTO admin (Admin_ID, Admin_Name, Admin_Password, Admin_Email) VALUES
('admin001', 'ผู้ดูแลระบบ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@rmutp.ac.th');

-- Dean (รองคณบดี)
INSERT INTO dean (Dean_ID, Dean_Name, Dean_Password, Department_ID, Dean_Email) VALUES
('dean001', 'ดร.ศรีสุดา อินทมาศ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department_01', 'srisuda.i@rmutp.ac.th');

-- Activity Heads (หัวหน้ากิจกรรม)
INSERT INTO activity_head (Activity_Head_ID, Activity_Head_Name, Activity_Head_Password, Department_ID, Activity_Head_Email, Activity_Head_Phone) VALUES
('head001', 'นางลาวัลย์ สายสุวรรณ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department_02', 'Lawan.s@rmutp.ac.th', '02-665-3555 ต่อ 2401'),
('head002', 'อาจารย์คัมภีร์ เนตรอัมพร', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department_03', 'khampee.n@rmutp.ac.th', '02-665-3555 ต่อ 2341'),
('head003', 'อาจารย์ศราวุธ แดงมาก', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department_04', 'sravudh.d@rmutp.ac.th', '02-665-3555 ต่อ 2362');

-- Clubs (สโมสรนักศึกษา)
INSERT INTO club (Club_ID, Club_Name, Club_Password, Faculty_ID, Branch_ID, Club_Email) VALUES
('club001', 'นายสมพงษ์ ขยัน', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'sompong@rmutp.ac.th'),
('club002', 'นายธนพล ดีมาก', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_04', 'thanapol@rmutp.ac.th'),
('club003', 'นางสาวชุติมา สวยงาม', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_03', 'chutima@rmutp.ac.th'),
('club004', 'นางสาวสมศรี มานะ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_06', 'somsri@rmutp.ac.th');

-- Students (นักศึกษา)
INSERT INTO student (Student_ID, Student_Name, Student_Password, Faculty_ID, Branch_ID, Student_Email, Student_Phone,Gender_ID) VALUES
('076760305034-9', 'นายธนาพล อยู่ยืน', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'THANAPOL-Y@rmutp.ac.th', '089-123-5923','Gender_01'),
('076760305001-8', 'นายสุขุม พวงแสงเพ็ญ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'sukhum-po@rmutp.ac.th', '094-247-4422','Gender_03'),
('076760305040-6', 'นายธีรชาติ คุณละ', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'theerachart-k@rmutp.ac.th', '095-111-2323','Gender_01'),
('076760305012-5', 'นายธนวุฒิ แก้วช่วย', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'thanawut-ka@rmutp.ac.th', '099-123-4572','Gender_02'),
('076760305011-7', 'นายธนวัฒน์ อิ่มเพชร', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'thanawat-im@rmutp.ac.th', '081-422-4467','Gender_01'),
('076760305018-2', 'นายกรวิชญ์ ยันตรีสิงห์', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty_01', 'Branch_01', 'korravit-y@rmutp.ac.th', '082-445-8888','Gender_01');


-- =============================================
-- 3. กิจกรรม (Activities)
-- =============================================

INSERT INTO activity (Activity_ID, Activity_Name, Activity_Details, Academic_Year, Activity_Type_ID, Activity_Date, Activity_Time, Activity_Location, Maximum_Capacity, Deadline, Activity_Status, Dean_ID, Activity_Head_ID) VALUES
('Act001', 'ค่ายอบรมผู้นำนักศึกษา', 'พัฒนาทักษะภาวะผู้นำและการทำงานเป็นทีม เพื่อเตรียมความพร้อมในการเป็นผู้นำในอนาคต', 2568, 'Activity_Type_02', '2026-01-20', '08:00:00', 'R101', 100, '2026-01-19 10:00:00', 'approved', 'dean001', 'head001'),
('Act002', 'กีฬาสีภายใน', 'การแข่งขันกีฬาประจำปี เพื่อส่งเสริมสุขภาพและความสามัคคีในหมู่นักศึกษา', 2568, 'Activity_Type_03', '2026-02-03', '09:00:00', 'โถงใต้ตึกอาคารพร้อมมงคล', 2000, '2026-02-02 08:00:00', 'approved', 'dean001', 'head002'),
('Act003', 'วันท่องเที่ยวแห่งชาติ', 'กิจกรรมจิตอาสาทำความสะอาดแหล่งท่องเที่ยว ร่วมกันรักษาสิ่งแวดล้อม ปลูกต้นไม้ และสร้างจิตสำนึกในการอนุรักษ์มรดกทางวัฒนธรรม', 2568, 'Activity_Type_04', '2026-03-04', '09:00:00', 'R301', 20, '2026-02-28 12:00:00', 'approved', 'dean001', 'head003');

-- =============================================
-- 4. การลงทะเบียน (Registrations)
-- =============================================

INSERT INTO registration (Student_ID, Activity_ID, Registration_Date, Registration_Status) VALUES
-- นายธนาพล ลงทะเบียน Act001, Act002, Act003
('076760305034-9', 'Act001', '2026-01-04 08:00:00', 'registered'),
('076760305034-9', 'Act002', '2026-01-04 10:00:00', 'registered'),
('076760305034-9', 'Act003', '2026-01-20 13:45:00', 'registered'),
-- นายสุขุม ลงทะเบียน Act001, Act002
('076760305001-8', 'Act001', '2026-01-10 12:00:00', 'registered'),
('076760305001-8', 'Act002', '2026-01-20 13:44:00', 'registered'),
-- นายธีรชาติ ลงทะเบียน Act001, Act002, Act003
('076760305040-6', 'Act001', '2026-01-20 13:44:00', 'registered'),
('076760305040-6', 'Act002', '2026-01-20 13:44:00', 'registered'),
('076760305040-6', 'Act003', '2026-01-20 13:45:00', 'registered'),
-- นายธนวุฒิ ลงทะเบียน Act003
('076760305012-5', 'Act003', '2026-01-20 10:25:00', 'registered'),
-- นายธนวัฒน์ ลงทะเบียน Act002
('076760305011-7', 'Act002', '2026-01-25 15:33:00', 'registered'),
-- นายกรวิชญ์ ลงทะเบียน Act001, Act003
('076760305018-2', 'Act001', '2026-01-26 10:00:00', 'registered'),
('076760305018-2', 'Act003', '2026-02-13 12:00:00', 'registered');

-- =============================================
-- 5. การเช็คอิน (Check-ins)
-- =============================================

INSERT INTO check_in (Student_ID, Activity_ID, Club_ID, CheckIn_Time) VALUES
-- เช็คอิน Act001 (ค่ายอบรมผู้นำ - 20 ม.ค. 2026)
('076760305034-9', 'Act001', 'club001', '2026-01-20 08:10:00'),
('076760305001-8', 'Act001', 'club003', '2026-01-20 07:45:00'),
('076760305018-2', 'Act001', 'club003', '2026-01-20 07:55:00'),
-- เช็คอิน Act002 (กีฬาสีภายใน - 3 ก.พ. 2026)
('076760305034-9', 'Act002', 'club002', '2026-02-03 08:30:00'),
('076760305040-6', 'Act002', 'club001', '2026-02-03 08:10:00'),
('076760305011-7', 'Act002', 'club001', '2026-02-03 08:28:00'),
-- เช็คอิน Act003 (วันท่องเที่ยวแห่งชาติ - 4 มี.ค. 2026)
('076760305040-6', 'Act003', 'club004', '2026-03-04 09:04:00'),
('076760305012-5', 'Act003', 'club003', '2026-03-04 08:29:00'),
('076760305018-2', 'Act003', 'club002', '2026-03-04 08:37:00');
