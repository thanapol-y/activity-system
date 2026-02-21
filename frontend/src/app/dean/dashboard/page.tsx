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
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear() + 543);

  React.useEffect(() => { document.title = 'ระบบลงทะเบียน – แดชบอร์ดรองคณบดี'; }, []);

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

  const availableYears = Array.from(new Set(activities.map(a => a.Academic_Year))).sort((a, b) => b - a);
  const filteredActivities = activities.filter(a => a.Academic_Year === yearFilter);

  const totalCount = filteredActivities.length;
  const approvedCount = filteredActivities.filter(a => a.Activity_Status === 'approved').length;
  const pendingCount = filteredActivities.filter(a => a.Activity_Status === 'pending').length;
  const rejectedCount = filteredActivities.filter(a => a.Activity_Status === 'rejected').length;

  const totalRegs = filteredActivities.reduce((s, a) => s + (a.Current_Registrations || 0), 0);
  const totalCapacity = filteredActivities.reduce((s, a) => s + (a.Maximum_Capacity || 0), 0);
  const totalHours = filteredActivities.reduce((s, a) => s + (a.Activity_Hours || 3), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalRegs / totalCapacity) * 100) : 0;

  // Activity type breakdown
  const typeMap = new Map<string, { name: string; count: number; regs: number; hours: number }>();
  filteredActivities.forEach(a => {
    const typeName = a.Activity_Type_Name || 'ทั่วไป';
    const existing = typeMap.get(typeName) || { name: typeName, count: 0, regs: 0, hours: 0 };
    existing.count++;
    existing.regs += a.Current_Registrations || 0;
    existing.hours += a.Activity_Hours || 3;
    typeMap.set(typeName, existing);
  });
  const activityTypeStats = Array.from(typeMap.values()).sort((a, b) => b.count - a.count);

  // Monthly distribution for current year
  const monthlyMap = new Map<number, number>();
  filteredActivities.forEach(a => {
    const m = new Date(a.Activity_Date).getMonth();
    monthlyMap.set(m, (monthlyMap.get(m) || 0) + 1);
  });
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const maxMonthly = Math.max(...Array.from(monthlyMap.values()), 1);

  // Upcoming activities
  const upcomingActivities = filteredActivities
    .filter(a => new Date(a.Activity_Date) >= new Date())
    .sort((a, b) => new Date(a.Activity_Date).getTime() - new Date(b.Activity_Date).getTime());

  // Top activities by registration
  const topActivities = [...filteredActivities]
    .sort((a, b) => (b.Current_Registrations || 0) - (a.Current_Registrations || 0))
    .slice(0, 5);

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">ภาพรวมกิจกรรมทั้งหมด</h1>
            <p className="text-sm md:text-base text-gray-600">สถิติและข้อมูลสรุปของกิจกรรมในระบบ ตามปีการศึกษา</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">ปีการศึกษา:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
            >
              {(availableYears.length > 0 ? availableYears : [new Date().getFullYear() + 543]).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Main KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] rounded-xl shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">กิจกรรมทั้งหมด</p>
                <p className="text-3xl font-bold">{totalCount}</p>
                <p className="text-xs opacity-70 mt-1">ปี {yearFilter}</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">ผู้ลงทะเบียนรวม</p>
                <p className="text-3xl font-bold">{totalRegs.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">จาก {totalCapacity.toLocaleString()} ที่นั่ง</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">ชั่วโมงกิจกรรมรวม</p>
                <p className="text-3xl font-bold">{totalHours.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">ชั่วโมง</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">อัตราเต็มเฉลี่ย</p>
                <p className="text-3xl font-bold">{fillRate}%</p>
                <p className="text-xs opacity-70 mt-1">ลงทะเบียน/ที่นั่ง</p>
              </div>
            </div>

            {/* Status breakdown (small, secondary) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                  <p className="text-xs text-gray-500">อนุมัติแล้ว</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-xs text-gray-500">รออนุมัติ</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                  <p className="text-xs text-gray-500">ไม่อนุมัติ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Activity Type Breakdown */}
              {activityTypeStats.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">แยกตามประเภทกิจกรรม</h3>
                  <div className="space-y-3">
                    {activityTypeStats.map((t) => {
                      const pct = totalCount > 0 ? Math.round((t.count / totalCount) * 100) : 0;
                      return (
                        <div key={t.name}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 font-medium">{t.name}</span>
                            <span className="text-sm text-gray-500">{t.count} กิจกรรม · {t.regs} คน · {t.hours} ชม.</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-[#2B4C8C] h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">จำนวนกิจกรรมรายเดือน</h3>
                <div className="flex items-end gap-1 h-40">
                  {monthNames.map((name, i) => {
                    const count = monthlyMap.get(i) || 0;
                    const height = maxMonthly > 0 ? Math.max((count / maxMonthly) * 100, count > 0 ? 8 : 0) : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        {count > 0 && <span className="text-xs font-bold text-[#2B4C8C] mb-1">{count}</span>}
                        <div
                          className="w-full bg-[#2B4C8C] rounded-t-sm transition-all hover:bg-[#3B5998]"
                          style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0px' }}
                          title={`${name}: ${count} กิจกรรม`}
                        ></div>
                        <span className="text-[10px] text-gray-500 mt-1">{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Activities by Registration */}
            {topActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมที่มีผู้ลงทะเบียนมากที่สุด</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลงทะเบียน</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ความจุ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%เต็ม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topActivities.map((act, i) => {
                        const pct = act.Maximum_Capacity > 0 ? Math.round(((act.Current_Registrations || 0) / act.Maximum_Capacity) * 100) : 0;
                        return (
                          <tr key={act.Activity_ID} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold text-gray-800">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{act.Activity_Name}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{act.Activity_Type_Name || 'ทั่วไป'}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(act.Activity_Date)}</td>
                            <td className="px-4 py-3 text-center font-semibold text-[#2B4C8C]">{act.Current_Registrations || 0}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{act.Maximum_Capacity}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${pct >= 90 ? 'text-red-600' : pct >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>{pct}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Upcoming Activities */}
            {upcomingActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมที่กำลังจะจัด ({upcomingActivities.length})</h3>
                <div className="space-y-3">
                  {upcomingActivities.slice(0, 5).map((act) => (
                    <div key={act.Activity_ID} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{act.Activity_Name}</h4>
                        <p className="text-sm text-gray-500">
                          {act.Activity_Type_Name || 'ทั่วไป'} · {formatDate(act.Activity_Date)} · {act.Activity_Time ? act.Activity_Time.substring(0, 5) + ' น.' : ''} · โดย {act.Activity_Head_Name || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-600">{act.Current_Registrations || 0}/{act.Maximum_Capacity} คน</span>
                        <span className="bg-[#2B4C8C] text-white text-xs font-bold px-2.5 py-1 rounded-full">{act.Activity_Hours || 3} ชม.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dean/approve" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2B4C8C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">อนุมัติกิจกรรม</h4>
                    <p className="text-xs text-gray-500">พิจารณากิจกรรมใหม่ {pendingCount > 0 && `(${pendingCount} รายการ)`}</p>
                  </div>
                </div>
              </Link>
              <Link href="/dean/history" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">ประวัติการอนุมัติ</h4>
                    <p className="text-xs text-gray-500">ดูประวัติย้อนหลัง</p>
                  </div>
                </div>
              </Link>
              <Link href="/dean/summary" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">สรุปภาพรวม</h4>
                    <p className="text-xs text-gray-500">เปรียบเทียบข้อมูลเชิงลึก</p>
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
