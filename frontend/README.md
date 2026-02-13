# Activity System - Frontend

ระบบลงทะเบียนเข้าร่วมกิจกรรม - Frontend (Next.js)

## 📋 Overview

Frontend application สร้างด้วย Next.js 15 + TypeScript + Tailwind CSS สำหรับระบบจัดการและลงทะเบียนกิจกรรมนักศึกษา รองรับ 4 บทบาทหลัก

## 🚀 Quick Start

### วิธีที่ 1: Double-click ไฟล์ (แนะนำ)

1. ตรวจสอบว่าติดตั้ง Node.js 18+ แล้ว
2. **Double-click** ไฟล์ `start-dev.bat` (Windows)
3. รอจนเห็นข้อความ "Ready in X.Xs"
4. เปิด browser ไปที่ **http://localhost:3000**

### วิธีที่ 2: Command Line

```bash
# ติดตั้ง dependencies (ครั้งแรกเท่านั้น)
npm install

# รัน Development Server
npm run dev

# Build Production
npm run build
npm start
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2B4C8C` (Navy Blue)
- **Secondary Blue**: `#3B5998`
- **Success Green**: `#28A745`
- **Danger Red**: `#DC3545`
- **Warning Orange**: `#FFA500`
- **Background**: `#F8F9FA` (Light Gray)
- **Footer Dark**: `#3A4A5C`

### Typography
- Font Family: Default system fonts (Arial, Helvetica, sans-serif)
- Responsive sizing with Tailwind CSS

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page (all roles)
│   │   ├── dean/                     # รองคณบดี pages
│   │   ├── activity-head/            # หัวหน้ากิจกรรม pages
│   │   ├── club/                     # สโมสรนักศึกษา pages
│   │   ├── student/                  # นักศึกษา pages
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   ├── page.tsx                  # Home page (redirect)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation bar
│   │   ├── Footer.tsx                # Footer component
│   │   └── ...                       # Other components
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context
│   │
│   ├── lib/
│   │   └── api.ts                    # API client & endpoints
│   │
│   └── types/
│       └── index.ts                  # TypeScript type definitions
│
├── public/                           # Static files
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── start-dev.bat                     # Windows start script
└── README.md                         # This file
```

## 👥 User Roles & Pages

### 1. นักศึกษา (Student)
- `/student/activities` - กิจกรรมทั้งหมด
- `/student/my-activities` - กิจกรรมของฉัน
- `/student/profile` - โปรไฟล์

**Features:**
- ค้นหาและลงทะเบียนกิจกรรม
- แสดง QR Code สำหรับเช็คอิน
- ยกเลิกการลงทะเบียน
- ดูประวัติการเข้าร่วม

### 2. สโมสรนักศึกษา (Club)
- `/club/dashboard` - หน้าหลัก
- `/club/scan` - สแกน QR Code
- `/club/reports` - รายงานปัญหา

**Features:**
- สแกน QR Code เพื่อเช็คอิน
- ดูรายชื่อผู้ลงทะเบียน
- บันทึกการเข้าร่วม
- รายงานปัญหาหน้างาน

### 3. หัวหน้ากิจกรรม (Activity Head)
- `/activity-head/dashboard` - Dashboard
- `/activity-head/activities` - จัดการกิจกรรม
- `/activity-head/students` - จัดการนักศึกษา
- `/activity-head/reports` - รายงาน

**Features:**
- สร้าง/แก้ไข/ลบกิจกรรม
- จัดการประเภทกิจกรรม
- มอบหมายสโมสรดูแลกิจกรรม
- ดูรายชื่อผู้ลงทะเบียน
- ติดตามสถานะการเข้าร่วม

### 4. รองคณบดีฝ่ายกิจการนักศึกษา (Dean)
- `/dean/dashboard` - Dashboard & สถิติ
- `/dean/approve` - อนุมัติกิจกรรม
- `/dean/history` - ประวัติการอนุมัติ

**Features:**
- ดูภาพรวมกิจกรรมทั้งหมด
- อนุมัติ/ปฏิเสธกิจกรรม
- ดูรายงานสถิติ
- ดูประวัติการอนุมัติ

## 🔐 Authentication

### Login Process
1. เลือกประเภทผู้ใช้งาน (Role)
2. กรอก User ID และ Password
3. ระบบ validate และ login
4. Redirect ไปหน้าที่เหมาะสมตาม Role

### User IDs Format
- **นักศึกษา**: 13 หลัก (ตัวอย่าง: `076760305034-9`)
- **สโมสรนักศึกษา**: รหัสสโมสร
- **หัวหน้ากิจกรรม**: รหัสหัวหน้ากิจกรรม
- **รองคณบดี**: รหัสรองคณบดี

### Token Management
- JWT token stored in localStorage
- Auto-redirect based on role after login
- Token included in API requests via Authorization header

## 📡 API Integration

### API Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### API Modules
- `authAPI` - Authentication endpoints
- `activitiesAPI` - Activity CRUD operations
- `registrationAPI` - Registration & check-in
- `statisticsAPI` - Statistics & reports

### Example Usage
```typescript
import { authAPI, activitiesAPI } from '@/lib/api';

// Login
const response = await authAPI.login(userId, password, role);

// Get activities
const activities = await activitiesAPI.getAll({ status: 'approved' });

// Register for activity
await registrationAPI.register(activityId);
```

## 🎯 Context & State Management

### AuthContext
Provides authentication state throughout the app:

```typescript
const { user, token, login, logout, isLoading } = useAuth();
```

**Features:**
- Persistent login (localStorage)
- Auto-redirect on login/logout
- Role-based access control
- Loading states

## 🧩 Components

### Navbar
- Dynamic menu based on user role
- User info display
- Logout button
- Active tab highlighting

### Footer
- Contact information
- Quick links
- Copyright notice

### Planned Components
- ActivityCard
- RegistrationModal
- QRCodeScanner
- StatisticsChart
- DataTable
- SearchBar
- FilterDropdown
- LoadingSpinner
- NotificationToast

## 🛠️ Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

### Adding New Pages

1. Create page in appropriate role directory
2. Add route to Navbar if needed
3. Implement with proper TypeScript types
4. Connect to API endpoints

### Code Style
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Use 'use client' for client components
- Implement proper error handling

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## ⚙️ Environment Variables

Create `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Environment
NEXT_PUBLIC_ENV=development
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### API Connection Failed
1. ตรวจสอบว่า Backend running ที่ port 5000
2. ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `.env.local`
3. ตรวจสอบ CORS settings ใน backend

### Login Issues
1. ตรวจสอบ User ID format
2. ตรวจสอบ Backend database มี users
3. ดู console.log สำหรับ error messages

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📚 Technologies

- **Next.js 15.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS
- **Context API** - State management

## 🔜 Next Steps

- [ ] Implement all role-specific pages
- [ ] Create reusable components
- [ ] Add QR Code scanning functionality
- [ ] Implement statistics/charts
- [ ] Add form validation
- [ ] Implement notifications/toasts
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add unit tests
- [ ] Optimize performance

## 📄 License

This project is for educational purposes only.

---

**Created with ❤️ for Activity Registration System**