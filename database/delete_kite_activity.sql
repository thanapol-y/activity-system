-- =============================================
-- ลบกิจกรรมเล่นว่าวและข้อมูลที่เกี่ยวข้องทั้งหมด
-- =============================================

USE activity_system;

-- ตรวจสอบกิจกรรมที่จะลบก่อน
SELECT Activity_ID, Activity_Name, Activity_Status, Academic_Year
FROM activity
WHERE Activity_Name LIKE '%ว่าว%' OR Activity_Name LIKE '%เล่นว่าว%';

-- ลบ check_in ที่เกี่ยวข้อง
DELETE ci FROM check_in ci
INNER JOIN registration r ON ci.Registration_ID = r.Registration_ID
INNER JOIN activity a ON r.Activity_ID = a.Activity_ID
WHERE a.Activity_Name LIKE '%ว่าว%' OR a.Activity_Name LIKE '%เล่นว่าว%';

-- ลบ registration ที่เกี่ยวข้อง
DELETE r FROM registration r
INNER JOIN activity a ON r.Activity_ID = a.Activity_ID
WHERE a.Activity_Name LIKE '%ว่าว%' OR a.Activity_Name LIKE '%เล่นว่าว%';

-- ลบกิจกรรมเล่นว่าว
DELETE FROM activity
WHERE Activity_Name LIKE '%ว่าว%' OR Activity_Name LIKE '%เล่นว่าว%';

-- ตรวจสอบผลลัพธ์
SELECT 'Remaining kite activities' as status, COUNT(*) as count
FROM activity
WHERE Activity_Name LIKE '%ว่าว%' OR Activity_Name LIKE '%เล่นว่าว%';
