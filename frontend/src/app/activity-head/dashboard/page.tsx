'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { statisticsAPI, activitiesAPI, reportsAPI } from '@/lib/api';
import { DashboardStats, Activity, ProblemReport } from '@/types';
import Link from 'next/link';

export default function ActivityHeadDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<ProblemReport[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activitiesResponse, reportsResponse] = await Promise.all([
        statisticsAPI.getActivityHead(),
        activitiesAPI.getAll({ limit: 10 }),
        reportsAPI.getForActivityHead().catch(() => ({ success: false, data: [] })),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data);
      }

      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data as ProblemReport[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">อนุมัติแล้ว</span>;
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">รออนุมัติ</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">ไม่อนุมัติ</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard หัวหน้ากิจกรรม</h1>
            <p className="text-gray-600">กดปุ่ม "สร้างกิจกรรม" เพื่อเพิ่มกิจกรรมใหม่ หรือดูรายชื่อผู้ลงทะเบียนและรายงานปัญหาได้ที่เมนูด้านบน</p>
          </div>
          <Link
            href="/activity-head/activities"
            className="bg-[#28A745] hover:bg-[#218838] text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            + เพิ่มกิจกรรมใหม่
          </Link>
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
              {/* Total Activities Created */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    ทั้งหมด
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.summary.totalActivities || 6}
                </h3>
                <p className="text-sm text-gray-600">กิจกรรมที่สร้าง</p>
              </div>

              {/* Approved Activities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    อนุมัติ
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.activitiesByStatus?.find(s => s.Activity_Status === 'approved')?.count || 2}
                </h3>
                <p className="text-sm text-gray-600">กิจกรรมที่อนุมัติ</p>
              </div>

              {/* Total Participants */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    รวม
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.summary.totalRegistrations || 6}
                </h3>
                <p className="text-sm text-gray-600">ผู้เข้าร่วมทั้งหมด</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ค้นหากิจกรรม..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    />
                    <svg
                      className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex space-x-3 ml-4">
                  <Link href="/activity-head/activities" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    จัดการกิจกรรม
                  </Link>
                  <Link href="/activity-head/reports" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    รายงาน
                  </Link>
                </div>
              </div>
            </div>

            {/* Problem Reports Notification */}
            {reports.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">รายงานปัญหาจากสโมสร</h3>
                    {reports.filter(r => r.Report_Status === 'pending').length > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {reports.filter(r => r.Report_Status === 'pending').length} ใหม่
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.Report_ID} className={`px-6 py-4 ${report.Report_Status === 'pending' ? 'bg-orange-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">{report.Activity_Name}</span>
                            {report.Report_Status === 'pending' && (
                              <span className="px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">รอดำเนินการ</span>
                            )}
                            {report.Report_Status === 'acknowledged' && (
                              <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">รับทราบแล้ว</span>
                            )}
                            {report.Report_Status === 'resolved' && (
                              <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">แก้ไขแล้ว</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{report.Report_Text}</p>
                          <p className="text-xs text-gray-400">โดย: {report.Club_Name} &bull; {new Date(report.Created_At).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {report.Report_Status === 'pending' && (
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            <button
                              onClick={async () => {
                                try {
                                  await reportsAPI.updateStatus(report.Report_ID, 'acknowledged');
                                  setReports(prev => prev.map(r => r.Report_ID === report.Report_ID ? { ...r, Report_Status: 'acknowledged' } : r));
                                } catch (e) { console.error(e); }
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              รับทราบ
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await reportsAPI.updateStatus(report.Report_ID, 'resolved');
                                  setReports(prev => prev.map(r => r.Report_ID === report.Report_ID ? { ...r, Report_Status: 'resolved' } : r));
                                } catch (e) { console.error(e); }
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              แก้ไขแล้ว
                            </button>
                          </div>
                        )}
                        {report.Report_Status === 'acknowledged' && (
                          <button
                            onClick={async () => {
                              try {
                                await reportsAPI.updateStatus(report.Report_ID, 'resolved');
                                setReports(prev => prev.map(r => r.Report_ID === report.Report_ID ? { ...r, Report_Status: 'resolved' } : r));
                              } catch (e) { console.error(e); }
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors ml-4 flex-shrink-0"
                          >
                            แก้ไขแล้ว
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">กิจกรรมของฉัน</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อกิจกรรม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่จัด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ลงทะเบียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          ยังไม่มีกิจกรรม
                        </td>
                      </tr>
                    ) : (
                      activities.filter(a => !searchTerm || a.Activity_Name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map((activity) => (
                        <tr key={activity.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.Activity_Name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.Activity_Type_Name || 'ทั่วไป'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(activity.Activity_Date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {activity.Activity_Time ? activity.Activity_Time.substring(0, 5) + ' น.' : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {activity.Current_Registrations || 0} / {activity.Maximum_Capacity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(activity.Activity_Status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Link href="/activity-head/activities" className="text-blue-600 hover:text-blue-800 font-medium">
                                แก้ไข
                              </Link>
                              <Link href={`/activity-head/students`} className="text-green-600 hover:text-green-800 font-medium">
                                ดูรายชื่อ
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {activities.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    แสดง 1 ถึง {Math.min(5, activities.length)} จาก {activities.length} รายการ
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      ก่อนหน้า
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-white bg-[#2B4C8C] rounded-lg">
                      1
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
