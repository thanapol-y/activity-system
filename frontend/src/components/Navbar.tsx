'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  roles?: UserRole[];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { label: 'หน้าหลัก', href: '/admin/dashboard' },
          { label: 'จัดการผู้ใช้', href: '/admin/users' },
        ];
      case UserRole.DEAN:
        return [
          { label: 'หน้าหลัก', href: '/dean/dashboard' },
          { label: 'อนุมัติกิจกรรม', href: '/dean/approve' },
          { label: 'ประวัติการอนุมัติ', href: '/dean/history' },
          { label: 'สรุปภาพรวม', href: '/dean/summary' },
        ];
      case UserRole.ACTIVITY_HEAD:
        return [
          { label: 'หน้าหลัก', href: '/activity-head/dashboard' },
          { label: 'จัดการกิจกรรม', href: '/activity-head/activities' },
          { label: 'ผู้ลงทะเบียน', href: '/activity-head/students' },
          { label: 'รายงาน', href: '/activity-head/reports' },
        ];
      case UserRole.CLUB:
        return [
          { label: 'หน้าหลัก', href: '/club/dashboard' },
          { label: 'สแกน QR', href: '/club/scan' },
          { label: 'ประวัติเช็คอิน', href: '/club/history' },
          { label: 'รายงานปัญหา', href: '/club/reports' },
        ];
      case UserRole.STUDENT:
        return [
          { label: 'หน้าหลัก', href: '/student/activities' },
          { label: 'กิจกรรมของฉัน', href: '/student/my-activities' },
          { label: 'ประวัติ', href: '/student/history' },
          { label: 'โปรไฟล์', href: '/student/profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'ผู้ดูแลระบบ';
      case UserRole.DEAN:
        return 'รองคณบดีฝ่ายกิจการนักศึกษา';
      case UserRole.ACTIVITY_HEAD:
        return 'หัวหน้ากิจกรรม';
      case UserRole.CLUB:
        return 'สโมสรนักศึกษา';
      case UserRole.STUDENT:
        return 'นักศึกษา';
      default:
        return '';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#2B4C8C] to-[#3B5998] text-white shadow-lg">
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain drop-shadow-sm"
            />
            <div className="text-xl font-bold">
              ระบบลงทะเบียนเข้าร่วมกิจกรรม
            </div>
            <div className="hidden md:block text-sm opacity-90">
              - {getRoleName(user.role)}
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-medium">{user.name}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {navItems.length > 0 && (
          <div className="flex space-x-1 pb-0 border-b border-white/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-6 py-3 text-sm font-medium transition-all relative
                    ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
