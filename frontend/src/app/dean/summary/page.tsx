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

  const totalActivities = stats?.summary.totalActivities || 0;
  const totalRegistrations = stats?.summary.totalRegistrations || 0;
  const totalCheckIns = stats?.summary.totalCheckIns || 0;
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0;
  const notAttended = totalRegistrations - totalCheckIns;

  const activityByStatus = stats?.activitiesByStatus || [];
  const topActivities = stats?.topActivities || [];

  const approvedCount = activityByStatus.find(s => s.Activity_Status === 'approved')?.count || 0;
  const pendingCount = activityByStatus.find(s => s.Activity_Status === 'pending')?.count || 0;
  const rejectedCount = activityByStatus.find(s => s.Activity_Status === 'rejected')?.count || 0;

  const totalHours = activities.reduce((sum, a) => sum + (a.Activity_Hours || 3), 0);
  const totalCapacity = activities.reduce((sum, a) => sum + (a.Maximum_Capacity || 0), 0);
  const totalRegsFromActivities = activities.reduce((sum, a) => sum + (a.Current_Registrations || 0), 0);
  const avgFillRate = totalCapacity > 0 ? Math.round((totalRegsFromActivities / totalCapacity) * 100) : 0;

  const upcomingActivities = activities.filter(a => new Date(a.Activity_Date) >= new Date()).sort((a, b) => new Date(a.Activity_Date).getTime() - new Date(b.Activity_Date).getTime());

  const activityTypeMap = new Map<string, { name: string; count: number; regs: number; hours: number }>();
  activities.forEach(a => {
    const typeName = a.Activity_Type_Name || 'ทั่วไป';
    const existing = activityTypeMap.get(typeName) || { name: typeName, count: 0, regs: 0, hours: 0 };
    existing.count++;
    existing.regs += a.Current_Registrations || 0;
    existing.hours += a.Activity_Hours || 3;
    activityTypeMap.set(typeName, existing);
  });
  const activityTypeStats = Array.from(activityTypeMap.values()).sort((a, b) => b.count - a.count);

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

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">สรุปภาพรวมกิจกรรม</h1>
          <p className="text-gray-600">ข้อมูลเชิงลึกและสถิติทั้งหมดของระบบกิจกรรม</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* KPI Row 1: Key Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-blue-500">
                <p className="text-xs text-gray-500 mb-1">กิจกรรมทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">{totalActivities}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-green-500">
                <p className="text-xs text-gray-500 mb-1">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-yellow-500">
                <p className="text-xs text-gray-500 mb-1">รออนุมัติ</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-red-500">
                <p className="text-xs text-gray-500 mb-1">ไม่อนุมัติ</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-purple-500">
                <p className="text-xs text-gray-500 mb-1">ชม.กิจกรรมรวม</p>
                <p className="text-2xl font-bold text-purple-600">{totalHours}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-indigo-500">
                <p className="text-xs text-gray-500 mb-1">ที่นั่งรวม</p>
                <p className="text-2xl font-bold text-indigo-600">{totalCapacity.toLocaleString()}</p>
              </div>
            </div>

            {/* KPI Row 2: Participation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] rounded-lg shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">ลงทะเบียนทั้งหมด</p>
                <p className="text-3xl font-bold">{totalRegistrations.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">คนลงทะเบียนรวมทุกกิจกรรม</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-lg shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">เช็คอินแล้ว</p>
                <p className="text-3xl font-bold">{totalCheckIns.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">เข้าร่วมจริง ({attendanceRate}%)</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">ยังไม่เช็คอิน</p>
                <p className="text-3xl font-bold">{notAttended.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">ลงทะเบียนแต่ไม่มา</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg shadow-md p-5 text-white">
                <p className="text-sm opacity-80 mb-1">อัตราเต็มเฉลี่ย</p>
                <p className="text-3xl font-bold">{avgFillRate}%</p>
                <p className="text-xs opacity-70 mt-1">ลงทะเบียน/ที่นั่งทั้งหมด</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

            {/* Activity Type Breakdown */}
            {activityTypeStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปแยกตามประเภทกิจกรรม</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activityTypeStats.map((t) => (
                    <div key={t.name} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">{t.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-gray-500">กิจกรรม</p>
                          <p className="text-lg font-bold text-[#2B4C8C]">{t.count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">ผู้ลงทะเบียน</p>
                          <p className="text-lg font-bold text-green-600">{t.regs}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">ชม.รวม</p>
                          <p className="text-lg font-bold text-purple-600">{t.hours}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Activities Table */}
            {topActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมยอดนิยม</h3>
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

            {/* Upcoming Activities */}
            {upcomingActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมที่กำลังจะจัด ({upcomingActivities.length})</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {upcomingActivities.map((act) => {
                    const regCount = act.Current_Registrations || 0;
                    const fillPct = act.Maximum_Capacity > 0 ? Math.round((regCount / act.Maximum_Capacity) * 100) : 0;
                    const fillColor = fillPct >= 90 ? 'bg-red-500' : fillPct >= 60 ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                      <div key={act.Activity_ID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{act.Activity_Name}</h4>
                            <p className="text-xs text-gray-500">{act.Activity_Type_Name || 'ทั่วไป'} · {act.Activity_Head_Name || '-'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#2B4C8C] text-white text-xs font-bold px-2 py-1 rounded-full">{act.Activity_Hours || 3} ชม.</div>
                            {getStatusBadge(act.Activity_Status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="text-gray-500">📅 {formatDate(act.Activity_Date)}</div>
                          <div className="text-gray-500">🕐 {act.Activity_Time ? act.Activity_Time.substring(0, 5) + ' น.' : '-'}</div>
                          <div className="text-gray-500 truncate">📍 {act.Activity_Location || '-'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className={`${fillColor} h-2 rounded-full`} style={{ width: `${fillPct}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{regCount}/{act.Maximum_Capacity} ({fillPct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Activities Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมทั้งหมด ({activities.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ชม.</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลงทะเบียน</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">ความจุ</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">%เต็ม</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวหน้า</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities.map((act) => {
                      const regCount = act.Current_Registrations || 0;
                      const fillPct = act.Maximum_Capacity > 0 ? Math.round((regCount / act.Maximum_Capacity) * 100) : 0;
                      return (
                        <tr key={act.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm font-medium text-gray-900">{act.Activity_Name}</td>
                          <td className="px-3 py-3 text-xs text-gray-500">{act.Activity_Type_Name || 'ทั่วไป'}</td>
                          <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(act.Activity_Date)}</td>
                          <td className="px-3 py-3 text-sm text-center font-bold text-[#2B4C8C]">{act.Activity_Hours || 3}</td>
                          <td className="px-3 py-3 text-sm text-center font-semibold">{regCount}</td>
                          <td className="px-3 py-3 text-sm text-center text-gray-600">{act.Maximum_Capacity}</td>
                          <td className="px-3 py-3 text-sm text-center">
                            <span className={`font-semibold ${fillPct >= 90 ? 'text-red-600' : fillPct >= 60 ? 'text-yellow-600' : 'text-green-600'}`}>{fillPct}%</span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600">{act.Activity_Head_Name || '-'}</td>
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
