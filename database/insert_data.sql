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
-- ไม่มีข้อมูลกิจกรรมในระบบ (ถูกลบทั้งหมด)

-- =============================================
-- 4. การลงทะเบียน (Registrations)
-- =============================================
-- ไม่มีข้อมูลการลงทะเบียน (ถูกลบทั้งหมด)

-- =============================================
-- 5. การเช็คอิน (Check-ins)
-- =============================================
-- ไม่มีข้อมูลการเช็คอิน (ถูกลบทั้งหมด)
