'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { statisticsAPI, activitiesAPI } from '@/lib/api';
import { DashboardStats, Activity } from '@/types';

export default function DeanDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        statisticsAPI.getOverall(),
        activitiesAPI.getAll({ limit: 100 }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (activitiesRes.success && activitiesRes.data) setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) return null;

  const activityByStatus = stats?.activitiesByStatus || [];
  const approvedCount = activityByStatus.find(s => s.Activity_Status === 'approved')?.count || 0;
  const pendingCount = activityByStatus.find(s => s.Activity_Status === 'pending')?.count || 0;
  const rejectedCount = activityByStatus.find(s => s.Activity_Status === 'rejected')?.count || 0;

  const pendingActivities = activities.filter(a => a.Activity_Status === 'pending');

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Dashboard รองคณบดี</h1>
          <p className="text-sm md:text-base text-gray-600">สถานะการอนุมัติกิจกรรม</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Status Cards - Simple & Clear */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Approved */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">อนุมัติแล้ว</p>
                    <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">กิจกรรม</p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending - Highlighted */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">รออนุมัติ</p>
                    <p className="text-5xl font-bold">{pendingCount}</p>
                    <p className="text-xs opacity-80 mt-1">กิจกรรมที่ต้องพิจารณา</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Link href="/dean/approve" className="mt-4 inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    ไปอนุมัติเลย →
                  </Link>
                )}
              </div>

              {/* Rejected */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ไม่อนุมัติ</p>
                    <p className="text-4xl font-bold text-red-600">{rejectedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">กิจกรรม</p>
                  </div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Activities List */}
            {pendingActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">กิจกรรมที่รออนุมัติ</h3>
                  <Link href="/dean/approve" className="text-sm text-[#2B4C8C] hover:underline font-medium">
                    ดูทั้งหมด →
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingActivities.slice(0, 5).map((act) => (
                    <div key={act.Activity_ID} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{act.Activity_Name}</h4>
                        <p className="text-sm text-gray-500">
                          {act.Activity_Type_Name || 'ทั่วไป'} · {formatDate(act.Activity_Date)} · โดย {act.Activity_Head_Name || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">{act.Activity_Hours || 3} ชม.</span>
                        <Link href="/dean/approve" className="px-4 py-2 bg-[#2B4C8C] text-white text-sm rounded-lg hover:bg-[#1e3a6e] transition-colors whitespace-nowrap">
                          พิจารณา
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dean/approve" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2B4C8C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">อนุมัติกิจกรรม</h4>
                    <p className="text-sm text-gray-500">พิจารณาและอนุมัติกิจกรรมใหม่</p>
                  </div>
                </div>
              </Link>

              <Link href="/dean/summary" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">สรุปภาพรวม</h4>
                    <p className="text-sm text-gray-500">ดูสถิติและข้อมูลเชิงลึก</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
