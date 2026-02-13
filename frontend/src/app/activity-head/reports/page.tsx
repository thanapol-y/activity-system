'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { statisticsAPI, activitiesAPI } from '@/lib/api';
import { DashboardStats, Activity } from '@/types';

export default function ActivityHeadReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExport, setSelectedExport] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        statisticsAPI.getActivityHead(),
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
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

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const toExport = selectedExport === 'all'
        ? activities
        : activities.filter(a => a.Activity_ID === selectedExport);

      const headers = ['รหัสกิจกรรม', 'ชื่อกิจกรรม', 'รายละเอียด', 'วันที่จัด', 'เวลา', 'สถานที่', 'ประเภท', 'ความจุสูงสุด', 'ผู้ลงทะเบียน', 'สถานะ', 'ปีการศึกษา'];
      const rows = toExport.map(a => [
        a.Activity_ID,
        a.Activity_Name,
        (a.Activity_Details || '').replace(/,/g, ' '),
        a.Activity_Date ? new Date(a.Activity_Date).toLocaleDateString('th-TH') : '',
        a.Activity_Time || '',
        a.Activity_Location || '',
        a.Activity_Type_Name || a.Activity_Type_ID || '',
        a.Maximum_Capacity,
        a.Current_Registrations || 0,
        a.Activity_Status === 'approved' ? 'อนุมัติ' : a.Activity_Status === 'pending' ? 'รออนุมัติ' : 'ไม่อนุมัติ',
        a.Academic_Year,
      ]);

      const BOM = '\uFEFF';
      const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_activities_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">รายงานสรุป</h1>
            <p className="text-gray-600">ดูสถิติและรายงานกิจกรรมทั้งหมดที่คุณสร้าง</p>
          </div>
        </div>

        {/* Export Section */}
        {!loading && activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">ส่งออกข้อมูล (Export)</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกกิจกรรม</label>
                <select
                  value={selectedExport}
                  onChange={(e) => setSelectedExport(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                >
                  <option value="all">ทั้งหมด ({activities.length} กิจกรรม)</option>
                  {activities.map((a) => (
                    <option key={a.Activity_ID} value={a.Activity_ID}>
                      {a.Activity_Name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exporting ? 'กำลังส่งออก...' : 'ส่งออก CSV / Excel'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">กิจกรรมทั้งหมด</p>
                <p className="text-3xl font-bold text-[#2B4C8C]">{stats?.summary.totalActivities || activities.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">ผู้ลงทะเบียนทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">{stats?.summary.totalRegistrations || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">เข้าร่วมแล้ว</p>
                <p className="text-3xl font-bold text-green-600">{stats?.summary.totalCheckIns || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">อัตราการเข้าร่วม</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.summary.totalRegistrations
                    ? Math.round((stats.summary.totalCheckIns / stats.summary.totalRegistrations) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Activities by Status */}
            {stats?.activitiesByStatus && stats.activitiesByStatus.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">จำนวนกิจกรรมแยกตามสถานะ</h3>
                <div className="space-y-3">
                  {stats.activitiesByStatus.map((item) => {
                    const total = stats.summary.totalActivities || 1;
                    const percent = Math.round((item.count / total) * 100);
                    const colorMap: Record<string, string> = {
                      approved: 'bg-green-500',
                      pending: 'bg-yellow-500',
                      rejected: 'bg-red-500',
                    };
                    return (
                      <div key={item.Activity_Status}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">
                            {item.Activity_Status === 'approved' ? 'อนุมัติแล้ว' :
                             item.Activity_Status === 'pending' ? 'รออนุมัติ' :
                             item.Activity_Status === 'rejected' ? 'ไม่อนุมัติ' : item.Activity_Status}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${colorMap[item.Activity_Status] || 'bg-gray-500'} h-3 rounded-full`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Activities */}
            {stats?.topActivities && stats.topActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมยอดนิยม</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">อันดับ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้ลงทะเบียน</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ความจุ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">เปอร์เซ็นต์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.topActivities.map((act, i) => {
                        const percent = act.Maximum_Capacity > 0
                          ? Math.round((act.registration_count / act.Maximum_Capacity) * 100)
                          : 0;
                        return (
                          <tr key={act.Activity_ID} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-bold text-gray-800">{i + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{act.Activity_Name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(act.Activity_Date)}</td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-[#2B4C8C]">{act.registration_count}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{act.Maximum_Capacity}</td>
                            <td className="px-4 py-3 text-sm text-center font-semibold">{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* All Activities Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">รายการกิจกรรมทั้งหมด</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานที่</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลงทะเบียน</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ความจุ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities.map((act) => (
                      <tr key={act.Activity_ID} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{act.Activity_Name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(act.Activity_Date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{act.Activity_Location}</td>
                        <td className="px-4 py-3 text-sm text-center">{act.Current_Registrations || 0}</td>
                        <td className="px-4 py-3 text-sm text-center">{act.Maximum_Capacity}</td>
                        <td className="px-4 py-3">{getStatusBadge(act.Activity_Status)}</td>
                      </tr>
                    ))}
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
