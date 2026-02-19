'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadProfile();
  }, [user]);

  if (!user) return null;

  const getRoleName = (role: string) => {
    switch (role) {
      case 'student': return 'นักศึกษา';
      case 'club': return 'สโมสรนักศึกษา';
      case 'activity_head': return 'หัวหน้ากิจกรรม';
      case 'dean': return 'รองคณบดีฝ่ายกิจการนักศึกษา';
      case 'admin': return 'ผู้ดูแลระบบ';
      default: return role;
    }
  };

  const profileRows = [
    { label: 'รหัสผู้ใช้', value: user.id },
    { label: 'ชื่อ-นามสกุล', value: user.name },
    { label: 'อีเมล', value: user.email },
    ...(profile ? [
      { label: 'เบอร์โทร', value: profile.Student_Phone || profile.Activity_Head_Phone },
      { label: 'เพศ', value: profile.Gender_Name },
      { label: 'คณะ', value: profile.Faculty_Name },
      { label: 'สาขา', value: profile.Branch_Name },
    ] : []),
    { label: 'บทบาท', value: getRoleName(user.role) },
  ].filter(r => r.value);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">โปรไฟล์</h1>
          <p className="text-sm md:text-base text-gray-600">ข้อมูลส่วนตัวของคุณ (ดูอย่างเดียว)</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2B4C8C] to-[#3B5998] p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-white/80 text-sm">{getRoleName(user.role)}</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B4C8C]"></div>
                  <p className="mt-2 text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileRows.map((row, idx) => (
                    <div key={idx} className={`flex items-center justify-between py-3 ${idx < profileRows.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <p className="text-sm text-gray-500">{row.label}</p>
                        <p className="text-gray-800 font-medium">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">ข้อมูลแก้ไขโดยผู้ดูแลระบบเท่านั้น</p>
                <p className="text-xs text-yellow-700 mt-1">หากต้องการเปลี่ยนแปลงข้อมูลหรือรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ (Admin)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
