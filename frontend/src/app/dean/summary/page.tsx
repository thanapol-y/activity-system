'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { statisticsAPI, activitiesAPI } from '@/lib/api';
import { DashboardStats, Activity } from '@/types';

export default function DeanSummaryPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearA, setYearA] = useState<number>(0);
  const [yearB, setYearB] = useState<number>(0);

  React.useEffect(() => { document.title = 'ระบบลงทะเบียน – สรุปภาพรวมกิจกรรม'; }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        statisticsAPI.getOverall(),
        activitiesAPI.getAll({ limit: 100 }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data);
        const years = Array.from(new Set(activitiesRes.data.map((a: Activity) => a.Academic_Year))).sort((a: number, b: number) => b - a);
        if (years.length >= 2) {
          setYearA(years[0]);
          setYearB(years[1]);
        } else if (years.length === 1) {
          setYearA(years[0]);
          setYearB(years[0]);
        }
      }
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

  // Helper: compute stats for a given year
  const computeYearStats = (year: number) => {
    const filtered = activities.filter(a => a.Academic_Year === year);
    const total = filtered.length;
    const approved = filtered.filter(a => a.Activity_Status === 'approved').length;
    const pending = filtered.filter(a => a.Activity_Status === 'pending').length;
    const rejected = filtered.filter(a => a.Activity_Status === 'rejected').length;
    const regs = filtered.reduce((s, a) => s + (a.Current_Registrations || 0), 0);
    const capacity = filtered.reduce((s, a) => s + (a.Maximum_Capacity || 0), 0);
    const hours = filtered.reduce((s, a) => s + (a.Activity_Hours || 3), 0);
    const fillRate = capacity > 0 ? Math.round((regs / capacity) * 100) : 0;
    // Type breakdown
    const typeMap = new Map<string, { name: string; count: number; regs: number }>();
    filtered.forEach(a => {
      const typeName = a.Activity_Type_Name || 'ทั่วไป';
      const existing = typeMap.get(typeName) || { name: typeName, count: 0, regs: 0 };
      existing.count++;
      existing.regs += a.Current_Registrations || 0;
      typeMap.set(typeName, existing);
    });
    const types = Array.from(typeMap.values()).sort((a, b) => b.count - a.count);
    return { total, approved, pending, rejected, regs, capacity, hours, fillRate, types };
  };

  const statsA = computeYearStats(yearA);
  const statsB = computeYearStats(yearB);

  // Change indicator
  const changeIcon = (a: number, b: number) => {
    if (a > b) return <span className="text-green-500 text-xs font-bold ml-1">▲ +{a - b}</span>;
    if (a < b) return <span className="text-red-500 text-xs font-bold ml-1">▼ {a - b}</span>;
    return <span className="text-gray-400 text-xs ml-1">—</span>;
  };

  const changePct = (a: number, b: number) => {
    if (b === 0) return a > 0 ? '+100%' : '—';
    const pct = Math.round(((a - b) / b) * 100);
    if (pct > 0) return `+${pct}%`;
    if (pct < 0) return `${pct}%`;
    return '—';
  };

  // All types across both years for comparison
  const allTypeNames = Array.from(new Set([...statsA.types.map(t => t.name), ...statsB.types.map(t => t.name)]));

  // Overall stats (all years) for bottom section
  const totalActivities = stats?.summary.totalActivities || 0;
  const totalRegistrations = stats?.summary.totalRegistrations || 0;
  const totalCheckIns = stats?.summary.totalCheckIns || 0;
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0;

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">อนุมัติ</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">รออนุมัติ</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">ไม่อนุมัติ</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">สรุปภาพรวมกิจกรรม</h1>
          <p className="text-sm md:text-base text-gray-600">เปรียบเทียบข้อมูลระหว่างปีการศึกษาและดูสถิติเชิงลึก</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Year Comparison Selectors */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">เปรียบเทียบปีการศึกษา</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#2B4C8C] rounded-full"></div>
                  <label className="text-sm text-gray-600">ปีที่ 1:</label>
                  <select value={yearA} onChange={(e) => setYearA(Number(e.target.value))} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white">
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <span className="text-gray-400 text-lg font-bold">VS</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <label className="text-sm text-gray-600">ปีที่ 2:</label>
                  <select value={yearB} onChange={(e) => setYearB(Number(e.target.value))} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white">
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Year A */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#2B4C8C]">
                <h3 className="text-lg font-bold text-[#2B4C8C] mb-4">ปีการศึกษา {yearA}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">กิจกรรม</p>
                    <p className="text-2xl font-bold text-gray-800">{statsA.total}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">ผู้ลงทะเบียน</p>
                    <p className="text-2xl font-bold text-green-700">{statsA.regs.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">ชั่วโมงรวม</p>
                    <p className="text-2xl font-bold text-purple-700">{statsA.hours}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">อัตราเต็ม</p>
                    <p className="text-2xl font-bold text-orange-700">{statsA.fillRate}%</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">อนุมัติ {statsA.approved}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">รอ {statsA.pending}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">ไม่อนุมัติ {statsA.rejected}</span>
                </div>
              </div>

              {/* Year B */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500">
                <h3 className="text-lg font-bold text-orange-600 mb-4">ปีการศึกษา {yearB}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">กิจกรรม</p>
                    <p className="text-2xl font-bold text-gray-800">{statsB.total}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">ผู้ลงทะเบียน</p>
                    <p className="text-2xl font-bold text-green-700">{statsB.regs.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">ชั่วโมงรวม</p>
                    <p className="text-2xl font-bold text-purple-700">{statsB.hours}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">อัตราเต็ม</p>
                    <p className="text-2xl font-bold text-orange-700">{statsB.fillRate}%</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">อนุมัติ {statsB.approved}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">รอ {statsB.pending}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">ไม่อนุมัติ {statsB.rejected}</span>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            {yearA !== yearB && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">เปรียบเทียบ ปี {yearA} vs ปี {yearB}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตัวชี้วัด</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#2B4C8C] uppercase">ปี {yearA}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-orange-600 uppercase">ปี {yearB}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">เปลี่ยนแปลง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: 'จำนวนกิจกรรม', a: statsA.total, b: statsB.total },
                        { label: 'ผู้ลงทะเบียนรวม', a: statsA.regs, b: statsB.regs },
                        { label: 'ชั่วโมงกิจกรรมรวม', a: statsA.hours, b: statsB.hours },
                        { label: 'ที่นั่งรวม', a: statsA.capacity, b: statsB.capacity },
                        { label: 'อัตราเต็ม (%)', a: statsA.fillRate, b: statsB.fillRate },
                        { label: 'อนุมัติแล้ว', a: statsA.approved, b: statsB.approved },
                        { label: 'รออนุมัติ', a: statsA.pending, b: statsB.pending },
                        { label: 'ไม่อนุมัติ', a: statsA.rejected, b: statsB.rejected },
                      ].map((row) => (
                        <tr key={row.label} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-800">{row.a.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-800">{row.b.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            {changeIcon(row.a, row.b)}
                            <span className="text-xs text-gray-400 ml-1">({changePct(row.a, row.b)})</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Type Comparison */}
            {yearA !== yearB && allTypeNames.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">เปรียบเทียบแยกตามประเภทกิจกรรม</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#2B4C8C] uppercase" colSpan={2}>ปี {yearA}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-orange-600 uppercase" colSpan={2}>ปี {yearB}</th>
                      </tr>
                      <tr>
                        <th></th>
                        <th className="px-2 py-1 text-center text-[10px] text-gray-400">กิจกรรม</th>
                        <th className="px-2 py-1 text-center text-[10px] text-gray-400">คน</th>
                        <th className="px-2 py-1 text-center text-[10px] text-gray-400">กิจกรรม</th>
                        <th className="px-2 py-1 text-center text-[10px] text-gray-400">คน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allTypeNames.map(name => {
                        const tA = statsA.types.find(t => t.name === name);
                        const tB = statsB.types.find(t => t.name === name);
                        return (
                          <tr key={name} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-700">{name}</td>
                            <td className="px-2 py-2 text-center text-gray-800 font-semibold">{tA?.count || 0}</td>
                            <td className="px-2 py-2 text-center text-gray-600">{tA?.regs || 0}</td>
                            <td className="px-2 py-2 text-center text-gray-800 font-semibold">{tB?.count || 0}</td>
                            <td className="px-2 py-2 text-center text-gray-600">{tB?.regs || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Overall System Stats */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติรวมทั้งระบบ (ทุกปี)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">กิจกรรมทั้งหมด</p>
                  <p className="text-2xl font-bold text-[#2B4C8C]">{totalActivities}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ลงทะเบียนรวม</p>
                  <p className="text-2xl font-bold text-green-700">{totalRegistrations.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">เช็คอินรวม</p>
                  <p className="text-2xl font-bold text-purple-700">{totalCheckIns.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">อัตราเข้าร่วม</p>
                  <p className="text-2xl font-bold text-orange-700">{attendanceRate}%</p>
                </div>
              </div>
            </div>

            {/* All Activities Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมทั้งหมด ({activities.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ปี</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ชม.</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลงทะเบียน</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">%เต็ม</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities.map((act) => {
                      const regCount = act.Current_Registrations || 0;
                      const fillPct = act.Maximum_Capacity > 0 ? Math.round((regCount / act.Maximum_Capacity) * 100) : 0;
                      return (
                        <tr key={act.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-medium text-gray-900">{act.Activity_Name}</td>
                          <td className="px-3 py-3 text-xs text-gray-500">{act.Activity_Type_Name || 'ทั่วไป'}</td>
                          <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(act.Activity_Date)}</td>
                          <td className="px-3 py-3 text-xs text-center text-gray-600">{act.Academic_Year}</td>
                          <td className="px-3 py-3 text-center font-bold text-[#2B4C8C]">{act.Activity_Hours || 3}</td>
                          <td className="px-3 py-3 text-center font-semibold">{regCount}/{act.Maximum_Capacity}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`font-semibold ${fillPct >= 90 ? 'text-red-600' : fillPct >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>{fillPct}%</span>
                          </td>
                          <td className="px-3 py-3">{getStatusBadge(act.Activity_Status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
