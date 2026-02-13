'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { statisticsAPI } from '@/lib/api';
import { DashboardStats } from '@/types';

export default function DeanDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getOverall();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  if (!user) return null;

  const totalActivities = stats?.summary.totalActivities || 0;
  const totalRegistrations = stats?.summary.totalRegistrations || 0;
  const totalCheckIns = stats?.summary.totalCheckIns || 0;
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0;
  const notAttended = totalRegistrations - totalCheckIns;

  const activityByStatus = stats?.activitiesByStatus || [];
  const topActivities = stats?.topActivities || [];

  const statusColors: Record<string, { bar: string }> = {
    approved: { bar: 'bg-green-500' },
    pending: { bar: 'bg-yellow-500' },
    rejected: { bar: 'bg-red-500' },
  };
  const statusLabels: Record<string, string> = {
    approved: 'อนุมัติแล้ว',
    pending: 'รอดำเนินการ',
    rejected: 'ปฏิเสธ',
  };

  const maxStatusCount = activityByStatus.length > 0 ? Math.max(...activityByStatus.map((s: { Activity_Status: string; count: number }) => s.count)) : 1;

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">ดูภาพรวมกิจกรรมและสถิติของระบบ</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalActivities}</h3>
                <p className="text-sm text-gray-600">กิจกรรมทั้งหมด</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalRegistrations.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">ลงทะเบียนทั้งหมด</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalCheckIns.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">เช็คอินทั้งหมด ({attendanceRate}%)</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Activity by Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">กิจกรรมแยกตามสถานะ</h3>
                {activityByStatus.length > 0 ? (
                  <div className="space-y-4">
                    {activityByStatus.map((item: { Activity_Status: string; count: number }) => (
                      <div key={item.Activity_Status}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">{statusLabels[item.Activity_Status] || item.Activity_Status}</span>
                          <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${statusColors[item.Activity_Status]?.bar || 'bg-gray-500'} h-3 rounded-full transition-all`}
                            style={{ width: `${Math.round((item.count / maxStatusCount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">ไม่มีข้อมูล</p>
                )}
              </div>

              {/* Participation Rate - Donut */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">อัตราการเข้าร่วมจริง</h3>
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40">
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                        <circle
                          cx="80" cy="80" r="60" fill="none" stroke="#2B4C8C" strokeWidth="20"
                          strokeDasharray={`${2 * Math.PI * 60 * (attendanceRate / 100)} ${2 * Math.PI * 60}`}
                          strokeDashoffset={2 * Math.PI * 60 * 0.25}
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <div className="text-3xl font-bold text-gray-800">{attendanceRate}%</div>
                        <div className="text-sm text-gray-600">เข้าร่วม</div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-[#2B4C8C] rounded-full"></div>
                        <span className="text-sm text-gray-600">เช็คอินแล้ว: {totalCheckIns.toLocaleString()} คน</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">ยังไม่เช็คอิน: {notAttended.toLocaleString()} คน</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Activities Table */}
            {topActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">กิจกรรมยอดนิยม</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้ลงทะเบียน</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">อัตราเต็ม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topActivities.slice(0, 5).map((act, i) => (
                        <tr key={act.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-bold text-gray-800">{i + 1}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{act.Activity_Name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{formatDate(act.Activity_Date)}</td>
                          <td className="px-4 py-4 text-sm text-center font-semibold text-[#2B4C8C]">{act.registration_count}</td>
                          <td className="px-4 py-4 text-sm text-center text-gray-600">
                            {act.registration_count}/{act.Maximum_Capacity}
                          </td>
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
