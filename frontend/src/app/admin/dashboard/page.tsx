'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { adminAPI, statisticsAPI } from '@/lib/api';
import { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        statisticsAPI.getOverall().catch(() => null),
        adminAPI.getDashboardStats().catch(() => null),
      ]);
      if (statsRes?.success && statsRes.data) setStats(statsRes.data);
      if (usersRes?.success && usersRes.data) {
        setUserCounts(usersRes.data.userCounts || {});
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) return null;

  const statCards = [
    { label: 'นักศึกษา', value: userCounts.student || 0, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👨‍🎓' },
    { label: 'สโมสร', value: userCounts.club || 0, color: 'text-green-600', bg: 'bg-green-50', icon: '🏛️' },
    { label: 'หัวหน้ากิจกรรม', value: userCounts.activity_head || 0, color: 'text-purple-600', bg: 'bg-purple-50', icon: '👤' },
    { label: 'รองคณบดี', value: userCounts.dean || 0, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🎓' },
  ];

  const activityStats = [
    { label: 'กิจกรรมทั้งหมด', value: stats?.summary.totalActivities || 0, color: 'text-[#2B4C8C]' },
    { label: 'ลงทะเบียนทั้งหมด', value: stats?.summary.totalRegistrations || 0, color: 'text-green-600' },
    { label: 'เช็คอินทั้งหมด', value: stats?.summary.totalCheckIns || 0, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-gray-600">ภาพรวมข้อมูลระบบทั้งหมด กดเมนู "จัดการผู้ใช้" ด้านบนเพื่อเพิ่ม/แก้ไข/ลบผู้ใช้งานทุก Role</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* User Counts */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">จำนวนผู้ใช้ในระบบ</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card) => (
                  <div key={card.label} className={`${card.bg} rounded-lg shadow-sm p-6 text-center`}>
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">สถิติกิจกรรม</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activityStats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">การดำเนินการ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
                >
                  <div className="bg-[#2B4C8C] p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">จัดการผู้ใช้</h3>
                    <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ รีเซ็ตรหัสผ่านผู้ใช้ทุก role</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 opacity-60">
                  <div className="bg-gray-400 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">ตั้งค่าระบบ</h3>
                    <p className="text-sm text-gray-500">เร็วๆ นี้...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Activities */}
            {stats?.topActivities && stats.topActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมยอดนิยม</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้ลงทะเบียน</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ความจุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.topActivities.slice(0, 5).map((act, i) => (
                        <tr key={act.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{i + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{act.Activity_Name}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-[#2B4C8C]">{act.registration_count}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{act.Maximum_Capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
