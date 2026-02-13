# Activity Registration System

ระบบลงทะเบียนเข้าร่วมกิจกรรม - โปรเจคจบ

## 📋 รายละเอียดโครงการ

ระบบจัดการและลงทะเบียนกิจกรรมนักศึกษา ที่รองรับ 4 บทบาทหลัก:
1. **รองคณบดีฝ่ายกิจการนักศึกษา** - อนุมัติกิจกรรม, ดูรายงานสถิติ
2. **หัวหน้ากิจกรรม** - สร้างและจัดการกิจกรรม
3. **สโมสรนักศึกษา** - ยืนยันการเข้าร่วมด้วย QR Code
4. **นักศึกษา** - ลงทะเบียนและเข้าร่วมกิจกรรม

## 🏗️ โครงสร้างโปรเจค

```
activity-system/
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   └── app/
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── start-dev.bat      # Script สำหรับรัน dev server (Windows)
│
├── backend/               # Express.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Authentication
│   │   │   ├── activityController.ts # Activity CRUD
│   │   │   ├── registrationController.ts # Registration & Check-in
│   │   │   └── statisticsController.ts   # Statistics & Reports
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT Authentication
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── activityRoutes.ts
│   │   │   ├── registrationRoutes.ts
│   │   │   └── statisticsRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   ├── utils/
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   └── qrcode.ts            # QR Code generation
│   │   └── server.ts                # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example                  # Environment variables template
│
└── database/
    └── schema.sql                   # Database schema

```

## 🚀 การติดตั้งและรันโปรเจค

### Prerequisites

- Node.js 18+ 
- npm หรือ yarn
- MySQL 8.0+
- Git (optional)

### 1. ติดตั้ง Database

```bash
# เข้า MySQL
mysql -u root -p

# สร้าง Database
CREATE DATABASE activity_system;
USE activity_system;

# Import schema
source database/schema.sql;
```

หรือใช้ phpMyAdmin:
1. เปิด phpMyAdmin
2. สร้าง Database ชื่อ `activity_system`
3. Import ไฟล์ `database/schema.sql`

### 2. ติดตั้ง Backend

```bash
cd backend

# ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
npm install

# สร้างไฟล์ .env
copy env.example .env
# หรือบน Mac/Linux: cp env.example .env

# แก้ไขไฟล์ .env ตามการตั้งค่า Database ของคุณ
```

**ไฟล์ .env:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=activity_system
DB_PORT=3306

PORT=5000
NODE_ENV=development

JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=M
```

```bash
# Compile TypeScript
npm run build

# รัน Backend (Development)
npm run dev

# หรือ Production
npm start
```

Backend จะรันที่ `http://localhost:5000`

### 3. ติดตั้ง Frontend

```bash
cd frontend

# ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
npm install

# รัน Development Server (เลือกวิธีใดวิธีหนึ่ง)

# วิธีที่ 1: Double-click ไฟล์
start-dev.bat

# วิธีที่ 2: Command line
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

## 📱 ฟีเจอร์หลัก

### 🎯 รองคณบดีฝ่ายกิจการนักศึกษา (Dean)

- ✅ ดูภาพรวมกิจกรรมทั้งหมดในคณะ
- ✅ ดูรายงานสถิติ (จำนวนผู้เข้าร่วม, ความนิยมกิจกรรม)
- ✅ อนุมัติ/ไม่อนุมัติกิจกรรมที่หัวหน้ากิจกรรมเสนอ
- ✅ ดูประวัติการอนุญาติของตัวเอง

### 👨‍💼 หัวหน้ากิจกรรม (Activity Head)

- ✅ สร้าง/เพิ่ม/ลบ/แก้ไขกิจกรรม
- ✅ เพิ่ม/ปรับเปลี่ยน หมวดหมู่กิจกรรม
- ✅ จัดการเวลา สถานที่ รายละเอียด และจำนวนผู้เข้าร่วม
- ✅ ตรวจสอบรายชื่อนักศึกษาที่ลงทะเบียน
- ✅ ติดตามสถานะการเข้าร่วมของนักศึกษา
- ✅ มอบหมายให้สโมสรนักศึกษาดูแลกิจกรรม

### 🎪 สโมสรนักศึกษา (Club)

- ✅ ตรวจสอบรายชื่อผู้ลงทะเบียน
- ✅ ยืนยันการเข้าร่วมกิจกรรมด้วยการสแกน QR Code
- ✅ บันทึกการเข้าร่วม / รายงานปัญหาหน้างาน
- ✅ ประวัติการยืนยันการเข้าร่วมกิจกรรม

### 🎓 นักศึกษา (Student)

- ✅ เข้าสู่ระบบด้วยรหัสประจำตัวนักศึกษา 13 หลัก + รหัสผ่าน
  - รูปแบบรหัส: `076760305034-9`
- ✅ ค้นหาและลงทะเบียนกิจกรรม
- ✅ แก้ไข/ยกเลิกรายการลงทะเบียนของตนเอง
- ✅ ตรวจสอบสถานะการลงทะเบียน
- ✅ แสดง QR Code เพื่อยืนยันตัวตนในวันกิจกรรม
- ✅ ตรวจสอบประวัติการเข้าร่วมกิจกรรมย้อนหลัง

## 🔐 API Endpoints

### Authentication

```
POST   /api/auth/login              # Login (all roles)
POST   /api/auth/register/student   # Register student
GET    /api/auth/profile            # Get profile
PUT    /api/auth/change-password    # Change password
```

### Activities

```
POST   /api/activities              # Create activity (Activity Head)
GET    /api/activities              # Get all activities (with filters)
GET    /api/activities/:id          # Get activity by ID
PUT    /api/activities/:id          # Update activity (Activity Head)
DELETE /api/activities/:id          # Delete activity (Activity Head)
POST   /api/activities/:id/approve  # Approve activity (Dean)
POST   /api/activities/:id/reject   # Reject activity (Dean)
GET    /api/activities/:id/registrations  # Get registrations
POST   /api/activities/:id/assign-club    # Assign club to activity
GET    /api/activities/:id/assigned-clubs # Get assigned clubs
```

### Registrations

```
POST   /api/registrations/register   # Register for activity (Student)
POST   /api/registrations/cancel     # Cancel registration (Student)
GET    /api/registrations/my         # Get my registrations (Student)
GET    /api/registrations/qr/:activityId  # Get QR code (Student)
POST   /api/registrations/checkin    # Check-in with QR (Club)
GET    /api/registrations/checkin-history/:activityId  # Check-in history
GET    /api/registrations/history    # Activity history (Student)
```

### Statistics

```
GET    /api/statistics/overall       # Overall statistics (Dean)
GET    /api/statistics/activity/:id  # Activity statistics
GET    /api/statistics/dean/approval-history  # Dean approval history
GET    /api/statistics/activity-head # Activity Head statistics
GET    /api/statistics/club          # Club statistics
```

## 🎨 Tech Stack

### Frontend
- **Next.js 15.5** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4** - Styling
- **QR Code Generator** - Generate QR codes

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL 8** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation

## 🔑 User Roles & Permissions

| Feature | Student | Club | Activity Head | Dean |
|---------|---------|------|---------------|------|
| View Activities | ✅ | ✅ | ✅ | ✅ |
| Register for Activity | ✅ | ❌ | ❌ | ❌ |
| Create Activity | ❌ | ❌ | ✅ | ❌ |
| Approve Activity | ❌ | ❌ | ❌ | ✅ |
| Scan QR Code | ❌ | ✅ | ❌ | ❌ |
| View Statistics | ❌ | ✅ | ✅ | ✅ |

## 📊 Database Schema

### Tables

1. **faculty** - คณะ
2. **branch** - สาขา
3. **department** - ภาควิชา
4. **activity_type** - ประเภทกิจกรรม
5. **student** - ข้อมูลนักศึกษา
6. **dean** - รองคณบดี
7. **activity_head** - หัวหน้ากิจกรรม
8. **club** - สโมสรนักศึกษา
9. **activity** - กิจกรรม
10. **registration** - การลงทะเบียน
11. **check_in** - การเช็คอิน
12. **activity_assignment** - มอบหมายสโมสรดูแลกิจกรรม

## 🎯 การใช้งาน

### สำหรับนักศึกษา

1. ลงทะเบียนเข้าระบบด้วยรหัสนักศึกษา 13 หลัก
2. เลือกกิจกรรมที่ต้องการเข้าร่วม
3. กดลงทะเบียน
4. รับ QR Code สำหรับเช็คอินวันกิจกรรม
5. แสดง QR Code ให้สโมสรสแกน

### สำหรับสโมสรนักศึกษา

1. Login เข้าระบบ
2. เลือกกิจกรรมที่ได้รับมอบหมาย
3. สแกน QR Code ของนักศึกษา
4. ระบบจะบันทึกการเข้าร่วมอัตโนมัติ

### สำหรับหัวหน้ากิจกรรม

1. Login เข้าระบบ
2. สร้างกิจกรรมใหม่
3. กรอกรายละเอียด (วันที่, เวลา, สถานที่, จำนวนที่รับ)
4. มอบหมายสโมสรดูแลกิจกรรม
5. รอคณบดีอนุมัติ
6. ตรวจสอบรายชื่อผู้ลงทะเบียน

### สำหรับรองคณบดี

1. Login เข้าระบบ
2. ดูกิจกรรมที่รออนุมัติ
3. ตรวจสอบรายละเอียด
4. อนุมัติหรือปฏิเสธ
5. ดูสถิติและรายงาน

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev     # Run with nodemon (auto-reload)
npm run build   # Compile TypeScript
npm run watch   # Watch mode
```

### Frontend Development

```bash
cd frontend
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # Run ESLint
```

## 📝 Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=activity_system
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# QR Code
QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=M
```

## 🐛 Troubleshooting

### Database Connection Error

1. ตรวจสอบว่า MySQL running อยู่
2. ตรวจสอบ username/password ใน `.env`
3. ตรวจสอบว่า database `activity_system` ถูกสร้างแล้ว

### Port Already in Use

```bash
# Kill process on port 5000 (Backend)
npx kill-port 5000

# Kill process on port 3000 (Frontend)
npx kill-port 3000
```

### Cannot Connect to Backend

1. ตรวจสอบว่า Backend running อยู่ที่ port 5000
2. ตรวจสอบ CORS settings
3. ตรวจสอบ `FRONTEND_URL` ใน backend `.env`

## 📱 Mobile Responsive

ระบบออกแบบให้รองรับการใช้งานบนมือถือเป็นหลัก:
- ✅ Responsive Design
- ✅ Touch-friendly UI
- ✅ QR Code Scanner (Camera)
- ✅ Mobile-first approach

## 🔮 Future Enhancements

- [ ] Email Notifications
- [ ] Push Notifications
- [ ] Export Reports (PDF/Excel)
- [ ] Activity Photos Gallery
- [ ] Student Feedback System
- [ ] Activity Certificates
- [ ] Multi-language Support
- [ ] Dark Mode Toggle

## 👥 Contributors

- **Your Name** - Full Stack Developer

## 📄 License

This project is for educational purposes only.

## 📞 Support

หากมีปัญหาการใช้งาน:
1. ตรวจสอบ README นี้
2. ดู Error logs ใน console
3. ติดต่อผู้พัฒนา

---

**สร้างด้วย ❤️ โดยโปรเจคจบ**