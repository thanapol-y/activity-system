# 🚀 คู่มือ Deploy ขึ้น Railway

## สิ่งที่ต้องมี
- บัญชี GitHub ([github.com](https://github.com))
- บัญชี Railway ([railway.app](https://railway.app)) — สมัครด้วย GitHub
- Git ติดตั้งในเครื่อง

---

## ขั้นที่ 1: สร้าง GitHub Repository

1. ไปที่ [github.com/new](https://github.com/new)
2. ตั้งชื่อ repo: `activity-system`
3. เลือก **Private** (ถ้าต้องการ)
4. **อย่าเลือก** Add README / .gitignore (เรามีแล้ว)
5. กด **Create repository**

## ขั้นที่ 2: Push โค้ดขึ้น GitHub

เปิด Terminal/PowerShell ที่โฟลเดอร์ `activity-system` แล้วรันทีละบรรทัด:

```bash
git init
git add .
git commit -m "Initial commit - Activity Registration System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/activity-system.git
git push -u origin main
```

> ⚠️ เปลี่ยน `YOUR_USERNAME` เป็น GitHub username ของคุณ

## ขั้นที่ 3: สร้าง Railway Project + MySQL

1. ไปที่ [railway.app](https://railway.app) → **Login with GitHub**
2. กด **New Project** → **Empty Project**
3. ใน project กด **+ New** → **Database** → **MySQL**
4. รอสักครู่ให้ MySQL พร้อม
5. คลิกที่ MySQL service → แท็บ **Data** → กด **Query**
6. Copy เนื้อหาจากไฟล์ `database/schema.sql` วางลงไป → กด **Run**
7. Copy เนื้อหาจากไฟล์ `database/insert_data.sql` วางลงไป → กด **Run**

> ✅ ตอนนี้ database พร้อมแล้ว

## ขั้นที่ 4: Deploy Backend

1. ใน Railway project เดิม กด **+ New** → **GitHub Repo** → เลือก `activity-system`
2. Railway จะถามให้ตั้งค่า:
   - **Service Name**: `backend`
3. คลิกที่ service `backend` → แท็บ **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. ไปแท็บ **Variables** → กด **New Variable** เพิ่มทีละตัว:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `JWT_SECRET` | `ตั้งรหัสลับยาวๆ เช่น activity-system-jwt-secret-2026` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

> 💡 ค่าที่ขึ้นต้นด้วย `${{MySQL.xxx}}` Railway จะแทนค่าจาก MySQL service ให้อัตโนมัติ

5. ไปแท็บ **Settings** → **Networking** → กด **Generate Domain**
   - จะได้ URL เช่น `backend-abc123.up.railway.app`
   - จดไว้ใช้ในขั้นถัดไป

6. รอ deploy เสร็จ (ดูแท็บ **Deployments** สถานะเป็น ✅)

## ขั้นที่ 5: Deploy Frontend

1. กด **+ New** → **GitHub Repo** → เลือก `activity-system` อีกครั้ง
2. ตั้งค่า:
   - **Service Name**: `frontend`
3. คลิกที่ service `frontend` → แท็บ **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. ไปแท็บ **Variables** → เพิ่ม:

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | `http://backend.railway.internal:5000` |
| `PORT` | `3000` |

> 💡 `backend.railway.internal` คือ internal network ของ Railway — service คุยกันได้โดยไม่ต้องผ่าน internet (เร็วกว่าและปลอดภัยกว่า)

5. ไปแท็บ **Settings** → **Networking** → กด **Generate Domain**
   - จะได้ URL เช่น `frontend-abc123.up.railway.app`
   - **นี่คือ URL สำหรับเข้าเว็บ!**

6. รอ deploy เสร็จ

## ขั้นที่ 6: ทดสอบ

1. เปิด URL ของ frontend ในเบราว์เซอร์
2. ลองล็อกอินด้วย user ที่มีใน insert_data.sql
3. ทดสอบฟีเจอร์ต่างๆ

---

## โครงสร้างบน Railway

```
Railway Project
├── 🗄️ MySQL           ← ฐานข้อมูล
├── ⚙️ backend          ← Node.js Express API (port 5000)
└── 🌐 frontend         ← Next.js Web App (port 3000)
```

---

## การอัพเดตโค้ด

หลังจาก deploy ครั้งแรกแล้ว ถ้าแก้โค้ดแล้วอยาก deploy ใหม่:

```bash
git add .
git commit -m "อธิบายสิ่งที่แก้ไข"
git push
```

Railway จะ **auto-deploy** ให้อัตโนมัติทุกครั้งที่ push ขึ้น GitHub!

---

## แก้ปัญหาที่พบบ่อย

### Backend deploy ไม่ผ่าน
- ตรวจสอบว่า Root Directory ตั้งเป็น `backend`
- ตรวจสอบ Variables ว่าครบทุกตัว

### Frontend ขึ้น Load Failed
- ตรวจสอบว่า `BACKEND_URL` ตั้งถูกต้อง
- ตรวจสอบว่า backend deploy สำเร็จก่อน

### ล็อกอินไม่ได้
- ตรวจสอบว่า import `schema.sql` และ `insert_data.sql` เข้า MySQL แล้ว
- ตรวจสอบ `JWT_SECRET` ว่าตั้งค่าแล้ว
