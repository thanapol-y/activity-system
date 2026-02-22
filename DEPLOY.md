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
git remote add origin https://github.com/thanapol-y/activity-system.git
git push -u origin main
```

> ⚠️ เปลี่ยน `YOUR_USERNAME` เป็น GitHub username ของคุณ

## ขั้นที่ 3: สร้าง Railway Project + MySQL

1. ไปที่ [railway.app](https://railway.app) → **Login with GitHub**
2. กด **New Project** → **Empty Project**
3. ใน project กด **+ New** → **Database** → **MySQL**
4. รอสักครู่ให้ MySQL พร้อม

### นำเข้าโครงสร้างและข้อมูลเข้า MySQL

ใช้ **MySQL CLI จาก XAMPP** ในเครื่อง เชื่อมต่อไปยัง Railway MySQL ผ่าน **Public Endpoint**

**วิธีดู connection info:**
1. คลิกที่ MySQL service บน Railway
2. ไปแท็บ **Variables** หรือ **Connect**
3. จดค่า `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

**รันคำสั่งใน PowerShell:**

```powershell
# นำเข้าโครงสร้างตาราง (schema)
& "C:\xampp\mysql\bin\mysql.exe" -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> --port <MYSQLPORT> --protocol=TCP <MYSQLDATABASE> < database\schema.sql

# นำเข้าข้อมูลตัวอย่าง (insert data)
& "C:\xampp\mysql\bin\mysql.exe" -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> --port <MYSQLPORT> --protocol=TCP <MYSQLDATABASE> < database\insert_data.sql
```

---

สรุปวิธีนี้คือ:
1. **XAMPP** ที่ติดตั้งในเครื่องมี `mysql.exe` (MySQL CLI client) อยู่แล้ว
2. Railway MySQL มี **Public Endpoint** (host + port) ที่สามารถเชื่อมต่อจากภายนอกได้
3. ใช้คำสั่ง `mysql.exe` + ข้อมูล connection ของ Railway → รันไฟล์ `schema.sql` และ `insert_data.sql` เข้าไปตรงๆ

กด **เปลี่ยนเป็น Code mode** แล้วผมจะแก้ไขไฟล์ให้เลยครับ


## ขั้นที่ 4: Deploy Backend

1. ใน Railway project เดิม กด **+ New** → **GitHub Repo** → เลือก `activity-system`
2. ตั้งชื่อ Service: `backend`
3. คลิกที่ service `backend` → แท็บ **Settings**:
   - **Root Directory**: `backend`
   - Railway จะตรวจเจอ [Dockerfile](cci:7://file:///c:/Users/Admin/AppData/Local/Programs/Zed/activity-system/backend/Dockerfile:0:0-0:0) ในโฟลเดอร์ backend แล้ว **build Docker image ให้อัตโนมัติ**
   - ไม่ต้องตั้ง Build Command / Start Command (Dockerfile จัดการให้แล้ว)

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

> 💡 ค่าที่ขึ้นต้นด้วย `${{MySQL.xxx}}` เป็น Reference Variable — Railway จะแทนค่าจาก MySQL service ให้อัตโนมัติ

5. ไปแท็บ **Settings** → **Networking** → กด **Generate Domain**
   - จะได้ URL เช่น `backend-abc123.up.railway.app`
   - จดไว้ใช้ในขั้นถัดไป

6. รอ deploy เสร็จ (ดูแท็บ **Deployments** สถานะเป็น ✅)

**หลักการทำงานของ Backend Dockerfile:**

## ขั้นที่ 5: Deploy Frontend

1. กด **+ New** → **GitHub Repo** → เลือก `activity-system` อีกครั้ง
2. ตั้งชื่อ Service: `frontend`
3. คลิกที่ service `frontend` → แท็บ **Settings**:
   - **Root Directory**: `frontend`
   - Railway จะตรวจเจอ [Dockerfile](cci:7://file:///c:/Users/Admin/AppData/Local/Programs/Zed/activity-system/backend/Dockerfile:0:0-0:0) แล้ว build Docker image ให้อัตโนมัติ
   - ไม่ต้องตั้ง Build Command / Start Command

4. ไปแท็บ **Variables** → เพิ่ม:

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | `http://backend.railway.internal:5000` |
| `PORT` | `3000` |

> ⚠️ **สำคัญ:** `BACKEND_URL` ถูกใช้เป็น **Docker Build Argument** ใน Dockerfile ซึ่ง Next.js จะนำค่านี้ไป bake ลงใน rewrites config ตอน build
> ดังนั้นถ้าเปลี่ยนค่า `BACKEND_URL` จะต้อง **re-deploy (build ใหม่)** ถึงจะมีผล

> 💡 `backend.railway.internal` คือ **Private Network** ภายใน Railway — service ในโปรเจกต์เดียวกันสื่อสารกันได้โดยไม่ต้องผ่าน internet (เร็วกว่าและปลอดภัยกว่า)

5. ไปแท็บ **Settings** → **Networking** → กด **Generate Domain**
   - จะได้ URL เช่น `frontend-abc123.up.railway.app`
   - **นี่คือ URL สำหรับเข้าใช้งานเว็บไซต์!**

6. รอ deploy เสร็จ

**หลักการทำงานของ Frontend Dockerfile (Multi-stage build):**

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