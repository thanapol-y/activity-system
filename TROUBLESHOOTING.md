# 🔧 Troubleshooting Guide - Activity Registration System

คู่มือแก้ปัญหาที่พบบ่อยในระบบลงทะเบียนเข้าร่วมกิจกรรม

---

## 📋 สารบัญ

1. [ปัญหา Frontend](#ปัญหา-frontend)
2. [ปัญหา Backend](#ปัญหา-backend)
3. [ปัญหา Database](#ปัญหา-database)
4. [ปัญหา Login](#ปัญหา-login)
5. [ปัญหา Port Conflicts](#ปัญหา-port-conflicts)
6. [Quick Fixes](#quick-fixes)

---

## ปัญหา Frontend

### ❌ Internal Server Error

**อาการ:** หน้าเว็บขึ้น "Internal Server Error" หรือหน้าขาว

**สาเหตุ:**
- Missing error components
- Build cache ค้าง
- TypeScript/ESLint errors

**วิธีแก้:**

```bash
# 1. ลบ cache และ build ใหม่
cd frontend
rm -rf .next
rm -rf node_modules/.cache

# 2. Build ใหม่
npm run build

# 3. ถ้ายัง error ให้ลง dependencies ใหม่
rm -rf node_modules package-lock.json
npm install
npm run build

# 4. Run dev server
npm run dev
```

### ❌ Page Not Found (404)

**อาการ:** เข้าหน้าใดหน้าหนึ่งแล้วได้ 404

**วิธีแก้:**
1. ตรวจสอบว่า dev server กำลังรันอยู่
2. Restart dev server
3. Clear browser cache (Ctrl+Shift+Delete)
4. ลอง Hard Refresh (Ctrl+F5)

### ❌ Cannot Find Module Error

**อาการ:** `Error: Cannot find module '@/...'`

**วิธีแก้:**
```bash
cd frontend
npm install
```

### ❌ White Screen / Blank Page

**อาการ:** หน้าเว็บขาวเปล่า ไม่มีอะไรขึ้น

**วิธีแก้:**
1. เปิด Browser Console (F12) ดู errors
2. ตรวจสอบว่า backend กำลังรันอยู่
3. ตรวจสอบ `.env.local` ว่ามี `NEXT_PUBLIC_API_URL` ถูกต้อง

---

## ปัญหา Backend

### ❌ Route Not Found

**อาการ:** Backend ตอบ `{"success":false,"message":"Route not found"}`

**สาเหตุ:** เข้า URL ผิด หรือ endpoint ไม่มี

**วิธีแก้:**
- ตรวจสอบว่าเข้า `/api/...` ไม่ใช่แค่ `/`
- ดูรายการ endpoints ที่ http://localhost:5000

### ❌ Database Connection Failed

**อาการ:** `Error: connect ECONNREFUSED` หรือ `Database connection failed`

**วิธีแก้:**

```bash
# 1. ตรวจสอบว่า MySQL running
# Windows:
net start | findstr MySQL

# 2. ตรวจสอบ .env
cd backend
cat .env

# 3. ทดสอบ connection
mysql -u root -p -e "SHOW DATABASES;"

# 4. สร้าง database (ถ้ายังไม่มี)
mysql -u root -p -e "CREATE DATABASE activity_system;"
```

### ❌ Module Not Found

**อาการ:** `Error: Cannot find module '...'`

**วิธีแก้:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ TypeScript Errors

**อาการ:** Build ล้มเหลว มี type errors

**วิธีแก้:**
```bash
cd backend
npm run build

# ถ้ายัง error ให้ดู error message แล้วแก้ไข
# หรือปิด strict mode ชั่วคราวใน tsconfig.json
```

---

## ปัญหา Database

### ❌ Login ไม่ได้ - Invalid Credentials

**อาการ:** กรอก username/password ถูกแล้วแต่ login ไม่ได้

**สาเหตุ:** Password ในฐานข้อมูลไม่ได้ hash

**วิธีแก้:**

```bash
# Import demo users ที่มี password hash แล้ว
mysql -u root -p activity_system < database/insert_demo_users.sql

# หรือผ่าน phpMyAdmin:
# 1. เปิด phpMyAdmin
# 2. เลือก database activity_system
# 3. ไปที่ Import
# 4. เลือกไฟล์ insert_demo_users.sql
# 5. กด Go
```

**Demo Users:**
- Student: `076760305034-9` / `password123`
- Dean: `DEAN001` / `password123`
- Activity Head: `HEAD001` / `password123`
- Club: `CLUB001` / `password123`

### ❌ Table Doesn't Exist

**อาการ:** `Error: Table 'activity_system.xxx' doesn't exist`

**วิธีแก้:**
```sql
-- 1. เข้า MySQL
mysql -u root -p

-- 2. ลบ database เก่า (ระวัง! จะลบข้อมูลทั้งหมด)
DROP DATABASE IF EXISTS activity_system;

-- 3. สร้างใหม่
CREATE DATABASE activity_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. ออกจาก MySQL
exit

-- 5. Import schema ใหม่
mysql -u root -p activity_system < database/schema.sql
mysql -u root -p activity_system < database/insert_demo_users.sql
```

### ❌ Foreign Key Constraint Error

**อาการ:** `Error: Cannot add or update a child row: a foreign key constraint fails`

**วิธีแก้:**
```sql
-- ปิด foreign key check ชั่วคราว
SET FOREIGN_KEY_CHECKS = 0;

-- ทำการ insert/update/delete

-- เปิดกลับ
SET FOREIGN_KEY_CHECKS = 1;
```

---

## ปัญหา Login

### ❌ ช่อง Input สีขาว มองไม่เห็นข้อความ

**สถานะ:** ✅ แก้ไขแล้วในเวอร์ชันล่าสุด

**ถ้ายังมีปัญหา:** Pull code ใหม่หรือแก้ไข CSS ใน `login/page.tsx`:
```tsx
className="... text-gray-900 bg-white"
```

### ❌ Token Expired

**อาการ:** Login ได้แต่พอเข้าหน้าอื่นโดน logout

**วิธีแก้:**
1. ลบ token เก่าออก: เปิด DevTools > Application > Local Storage > ลบทั้งหมด
2. Login ใหม่
3. ตรวจสอบ `JWT_SECRET` ใน backend `.env`

### ❌ CORS Error

**อาการ:** `Access to fetch blocked by CORS policy`

**วิธีแก้:**

```bash
# ตรวจสอบ backend .env
cd backend
cat .env | grep FRONTEND_URL

# ต้องเป็น:
FRONTEND_URL=http://localhost:3000

# Restart backend
npm run dev
```

---

## ปัญหา Port Conflicts

### ❌ Port 3000 Already in Use

**อาการ:** `Error: Port 3000 is already in use`

**วิธีแก้:**

```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# หรือใช้ port อื่น:
PORT=3001 npm run dev
```

### ❌ Port 5000 Already in Use

**อาการ:** Backend ไม่สามารถ start ได้

**วิธีแก้:**

```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# หรือเปลี่ยน port ใน backend/.env:
PORT=5001
```

---

## Quick Fixes

### 🔄 Reset ทั้งระบบ

```bash
# 1. หยุด servers ทั้งหมด (Ctrl+C)

# 2. ลบ cache ทั้งหมด
cd frontend
rm -rf .next node_modules/.cache

cd ../backend  
rm -rf dist

# 3. Rebuild
cd ../frontend
npm run build

cd ../backend
npm run build

# 4. Restart
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### 🗄️ Reset Database

```bash
# 1. Backup (optional)
mysqldump -u root -p activity_system > backup.sql

# 2. Drop & Recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS activity_system;"
mysql -u root -p -e "CREATE DATABASE activity_system;"

# 3. Import
mysql -u root -p activity_system < database/schema.sql
mysql -u root -p activity_system < database/insert_demo_users.sql
```

### 🧹 Clean Install

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

---

## 🆘 ยังแก้ไม่ได้?

### Checklist ตรวจสอบก่อนขอความช่วยเหลือ:

- [ ] Node.js version 18+ ติดตั้งแล้ว
- [ ] MySQL 8.0+ กำลังรันอยู่
- [ ] Database `activity_system` ถูกสร้างแล้ว
- [ ] Tables ถูก import แล้ว (schema.sql)
- [ ] Demo users ถูก import แล้ว (insert_demo_users.sql)
- [ ] Backend `.env` ถูกตั้งค่าแล้ว
- [ ] Frontend `.env.local` ถูกตั้งค่าแล้ว
- [ ] Dependencies ถูกติดตั้งแล้ว (npm install)
- [ ] Build สำเร็จ (npm run build)
- [ ] Port 3000 และ 5000 ว่าง
- [ ] Browser console ไม่มี errors (F12)

### Debug Mode

```bash
# Run ในโหมด debug เพื่อดู error แบบละเอียด

# Backend:
cd backend
NODE_ENV=development npm run dev

# Frontend:
cd frontend
npm run dev
```

### เก็บ Logs

```bash
# Backend logs
cd backend
npm run dev > backend.log 2>&1

# Frontend logs
cd frontend
npm run dev > frontend.log 2>&1
```

---

## 📞 ติดต่อสอบถาม

หากยังพบปัญหา:
1. ตรวจสอบ error messages ใน console
2. ตรวจสอบ logs ใน terminal
3. ลอง clean install ทั้งหมดใหม่
4. ดู README.md และ documentation

---

**อัพเดทล่าสุด:** 12 ก.พ. 2568  
**เวอร์ชัน:** 1.0.0