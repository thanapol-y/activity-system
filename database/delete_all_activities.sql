-- =============================================
-- ลบข้อมูลกิจกรรมทั้งหมดในระบบ
-- =============================================

USE activity_system;

-- ลบข้อมูลการเช็คอินทั้งหมด
DELETE FROM check_in;

-- ลบข้อมูลการลงทะเบียนทั้งหมด
DELETE FROM registration;

-- ลบข้อมูลกิจกรรมทั้งหมด
DELETE FROM activity;

-- =============================================
-- ตรวจสอบผลลัพธ์
-- =============================================

SELECT 'Activities deleted' as status, COUNT(*) as count FROM activity;
SELECT 'Registrations deleted' as status, COUNT(*) as count FROM registration;
SELECT 'Check-ins deleted' as status, COUNT(*) as count FROM check_in;
