# Activity System - Backend API

Backend API server สำหรับระบบลงทะเบียนเข้าร่วมกิจกรรม

## 📋 Overview

REST API ที่สร้างด้วย Express.js + TypeScript รองรับการจัดการกิจกรรม การลงทะเบียน และระบบ QR Code สำหรับการเช็คอิน

## 🚀 Quick Start

### วิธีที่ 1: Double-click ไฟล์ (แนะนำ)

1. ตรวจสอบว่าติดตั้ง Node.js และ MySQL แล้ว
2. Import database schema (ดูขั้นตอนด้านล่าง)
3. แก้ไขไฟล์ `.env` ตามการตั้งค่า Database
4. **Double-click** ไฟล์ `start-dev.bat`
5. รอจนเห็นข้อความ "Server running on"
6. เปิด browser ไปที่ http://localhost:5000/health

### วิธีที่ 2: Command Line

```bash
# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# รัน Development Server
npm run dev

# หรือ Compile แล้วรัน Production
npm run build
npm start
```

## 📦 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation
- **nodemon** - Auto-reload development
- **ts-node** - TypeScript execution

## 🗄️ Database Setup

### 1. สร้าง Database

```sql
CREATE DATABASE activity_system;
```

### 2. Import Schema

**ผ่าน Command Line:**
```bash
mysql -u root -p activity_system < ../database/schema.sql
```

**ผ่าน phpMyAdmin:**
1. เปิด phpMyAdmin
2. เลือก database `activity_system`
3. ไปที่แท็บ "Import"
4. เลือกไฟล์ `database/schema.sql`
5. กด "Go"

### 3. ตรวจสอบ Tables

```sql
USE activity_system;
SHOW TABLES;
```

ควรเห็น 12 tables:
- faculty
- branch
- department
- activity_type
- student
- dean
- activity_head
- club
- activity
- registration
- check_in
- activity_assignment

## ⚙️ Environment Variables

แก้ไขไฟล์ `.env` ตามการตั้งค่าของคุณ:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=activity_system
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# QR Code Configuration
QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=M
```

**⚠️ สำคัญ:** เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัยใน production

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/login                    # Login (all roles)
POST   /api/auth/register/student         # Register student
GET    /api/auth/profile                  # Get profile (requires auth)
PUT    /api/auth/change-password          # Change password (requires auth)
```

### Activities

```
POST   /api/activities                    # Create activity (Activity Head)
GET    /api/activities                    # Get all activities
GET    /api/activities/:id                # Get activity by ID
PUT    /api/activities/:id                # Update activity (Activity Head)
DELETE /api/activities/:id                # Delete activity (Activity Head)
POST   /api/activities/:id/approve        # Approve activity (Dean)
POST   /api/activities/:id/reject         # Reject activity (Dean)
GET    /api/activities/:id/registrations  # Get registrations (Activity Head/Club)
POST   /api/activities/:id/assign-club    # Assign club (Activity Head)
GET    /api/activities/:id/assigned-clubs # Get assigned clubs
```

### Registrations

```
POST   /api/registrations/register        # Register for activity (Student)
POST   /api/registrations/cancel          # Cancel registration (Student)
GET    /api/registrations/my              # Get my registrations (Student)
GET    /api/registrations/qr/:activityId  # Get QR code (Student)
POST   /api/registrations/checkin         # Check-in with QR (Club)
GET    /api/registrations/checkin-history/:activityId  # Check-in history (Club)
GET    /api/registrations/history         # Activity history (Student)
```

### Statistics

```
GET    /api/statistics/overall            # Overall statistics (Dean)
GET    /api/statistics/activity/:id       # Activity statistics (Activity Head/Dean)
GET    /api/statistics/dean/approval-history  # Dean approval history (Dean)
GET    /api/statistics/activity-head      # Activity Head statistics
GET    /api/statistics/club               # Club statistics
```

### Health Check

```
GET    /health                            # Server health check
```

## 🔐 Authentication

API ใช้ JWT (JSON Web Token) สำหรับ authentication

### การ Login

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "userId": "076760305034-9",
  "password": "your_password",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "076760305034-9",
    "name": "นักศึกษา ทดสอบ",
    "email": "student@example.com",
    "role": "student"
  }
}
```

### การใช้ Token

ส่ง token ใน Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 User Roles

| Role | Description | Key |
|------|-------------|-----|
| **student** | นักศึกษา | ลงทะเบียนกิจกรรม, ดู QR Code |
| **club** | สโมสรนักศึกษา | สแกน QR Code, เช็คอิน |
| **activity_head** | หัวหน้ากิจกรรม | สร้าง/จัดการกิจกรรม |
| **dean** | รองคณบดี | อนุมัติกิจกรรม, ดูสถิติ |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection pool
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── activityController.ts # Activity CRUD operations
│   │   ├── registrationController.ts # Registration & check-in
│   │   └── statisticsController.ts   # Statistics & reports
│   ├── middleware/
│   │   └── auth.ts              # JWT auth & authorization
│   ├── routes/
│   │   ├── index.ts             # Main router
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── activityRoutes.ts    # Activity endpoints
│   │   ├── registrationRoutes.ts # Registration endpoints
│   │   └── statisticsRoutes.ts  # Statistics endpoints
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── jwt.ts               # JWT helper functions
│   │   └── qrcode.ts            # QR code generation
│   └── server.ts                # Express app entry point
├── dist/                        # Compiled JavaScript (auto-generated)
├── node_modules/                # Dependencies
├── .env                         # Environment variables
├── env.example                  # Environment template
├── nodemon.json                 # Nodemon configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── start-dev.bat               # Windows start script
├── start-dev.sh                # Linux/Mac start script
└── README.md                    # This file
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev       # Start development server with auto-reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run compiled production server
npm run watch     # Watch mode for TypeScript compilation
```

### Adding New Endpoints

1. สร้าง controller function ใน `src/controllers/`
2. สร้าง route ใน `src/routes/`
3. เพิ่ม middleware ถ้าจำเป็น
4. Test endpoint

### Middleware Usage

```typescript
import { authenticate, isDean, isStudent } from '../middleware/auth';

// Require authentication
router.get('/protected', authenticate, handler);

// Require specific role
router.get('/dean-only', authenticate, isDean, handler);

// Multiple roles
router.get('/multi', authenticate, authorize(UserRole.DEAN, UserRole.ACTIVITY_HEAD), handler);
```

## 🧪 Testing API

### ผ่าน Browser (GET requests)

```
http://localhost:5000/health
http://localhost:5000/api/activities
```

### ผ่าน cURL

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"076760305034-9","password":"password123","role":"student"}'

# Get activities (with auth)
curl http://localhost:5000/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ผ่าน Postman

1. Import collection หรือสร้างใหม่
2. ตั้งค่า base URL: `http://localhost:5000/api`
3. เพิ่ม Authorization header สำหรับ protected routes
4. Test endpoints

## 🐛 Troubleshooting

### ❌ Database Connection Failed

**ปัญหา:** `Error: connect ECONNREFUSED`

**แก้ไข:**
1. ตรวจสอบว่า MySQL กำลังรันอยู่
2. ตรวจสอบ username/password ใน `.env`
3. ตรวจสอบว่า database `activity_system` ถูกสร้างแล้ว

```bash
# ตรวจสอบ MySQL status (Windows)
net start | findstr MySQL

# ตรวจสอบ MySQL status (Linux/Mac)
sudo systemctl status mysql
```

### ❌ Port 5000 Already in Use

**ปัญหา:** `Error: listen EADDRINUSE: address already in use :::5000`

**แก้ไข:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# หรือเปลี่ยน PORT ใน .env
PORT=5001
```

### ❌ Module Not Found

**ปัญหา:** `Error: Cannot find module 'express'`

**แก้ไข:**
```bash
# ติดตั้ง dependencies ใหม่
npm install

# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### ❌ TypeScript Errors

**ปัญหา:** Type errors during compilation

**แก้ไข:**
```bash
# ตรวจสอบ TypeScript errors
npx tsc --noEmit

# ติดตั้ง type definitions
npm install -D @types/express @types/node
```

### ❌ JWT Token Invalid

**ปัญหา:** `401 Unauthorized - Invalid or expired token`

**แก้ไข:**
1. ตรวจสอบว่า token ยังไม่หมดอายุ
2. ตรวจสอบ format: `Bearer <token>`
3. Login ใหม่เพื่อรับ token ใหม่

## 📊 Database Schema

### Key Tables

**students** - ข้อมูลนักศึกษา
- Student_ID (PK) - รหัสนักศึกษา 13 หลัก
- Student_Name, Student_Password, Student_Email

**activity** - กิจกรรม
- Activity_ID (PK)
- Activity_Name, Activity_Details
- Activity_Date, Activity_Time, Activity_Location
- Maximum_Capacity, Activity_Status

**registration** - การลงทะเบียน
- Student_ID (FK), Activity_ID (FK)
- Registration_Date, QR_Code_Data
- Registration_Status

**check_in** - การเช็คอิน
- Student_ID (FK), Activity_ID (FK), Club_ID (FK)
- CheckIn_Time

## 🔒 Security

### Password Hashing

- ใช้ **bcryptjs** สำหรับ hash passwords
- Salt rounds: 10
- ห้ามเก็บ plain text passwords

### JWT Security

- ใช้ secret key ที่แข็งแรง
- Token หมดอายุใน 7 วัน
- Refresh token (future enhancement)

### SQL Injection Prevention

- ใช้ parameterized queries
- ไม่ concatenate SQL strings
- Validate input data

## 📝 Sample Data

หลังจาก import schema แล้ว จะมี sample data:

**Faculties:**
- FAC001: คณะวิทยาศาสตร์และเทคโนโลยี
- FAC002: คณะบริหารธุรกิจ

**Activity Types:**
- TYPE001: กิจกรรมบังคับเข้า
- TYPE002: กิจกรรมด้านวิชาการ
- TYPE003: กิจกรรมด้านกีฬา
- TYPE004: กิจกรรมด้านศิลปวัฒนธรรม
- TYPE005: กิจกรรมบำเพ็ญประโยชน์

## 🚀 Deployment

### Production Checklist

- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า `NODE_ENV=production`
- [ ] ใช้ HTTPS
- [ ] เปิด CORS เฉพาะ domains ที่ต้องการ
- [ ] Setup database backup
- [ ] Setup logging
- [ ] Setup monitoring
- [ ] ใช้ environment variables แทน hardcoded values

### Build for Production

```bash
npm run build
npm start
```

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ error logs ใน console
2. ดู Troubleshooting section
3. ตรวจสอบ environment variables
4. ติดต่อผู้พัฒนา

## 📄 License

This project is for educational purposes only.

---

**Created with ❤️ for Activity Registration System**