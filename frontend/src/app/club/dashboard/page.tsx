"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { statisticsAPI, reportsAPI } from "@/lib/api";
import { DashboardStats } from "@/types";
import Link from "next/link";

export default function ClubDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportActivity, setReportActivity] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getClub();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard สโมสรนักศึกษา
            </h1>
            <p className="text-gray-600">
              ยินดีต้อนรับ {user?.name || ''} กดปุ่ม "สแกน QR" เพื่อเช็คอินนักศึกษา หรือดูประวัติเช็คอินได้ที่เมนูด้านบน
            </p>
          </div>
          <Link
            href="/club/scan"
            className="bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
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
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span>สแกน QR Code</span>
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
              {/* Total Activities */}
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    ทั้งหมด
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.summary?.totalActivities || 0}
                </h3>
                <p className="text-sm text-gray-600">กิจกรรมทั้งหมดในระบบ</p>
              </div>

              {/* Total Check-ins */}
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
                    ทั้งหมด
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.summary.totalCheckIns || 0}
                </h3>
                <p className="text-sm text-gray-600">การเช็คอินทั้งหมด</p>
              </div>

              {/* Upcoming Activities */}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    ใกล้ถึง
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stats?.upcomingActivities?.length || 0}
                </h3>
                <p className="text-sm text-gray-600">กิจกรรมที่กำลังจะถึง</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link
                href="/club/scan"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-[#2B4C8C] p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      สแกน QR Code
                    </h3>
                    <p className="text-sm text-gray-600">เช็คอินนักศึกษา</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setShowReportModal(true)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow group text-left w-full"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      รายงานปัญหา
                    </h3>
                    <p className="text-sm text-gray-600">แจ้งปัญหาที่เกิดขึ้นในกิจกรรม</p>
                  </div>
                </div>
              </button>

              <Link
                href="/club/history"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      ประวัติการเช็คอิน
                    </h3>
                    <p className="text-sm text-gray-600">ดูประวัติทั้งหมด</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Upcoming Activities Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  กิจกรรมที่กำลังจะถึง
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อกิจกรรม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ลงทะเบียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เช็คอินแล้ว
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!stats?.upcomingActivities ||
                    stats.upcomingActivities.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          ไม่มีกิจกรรมที่กำลังจะถึง
                        </td>
                      </tr>
                    ) : (
                      stats.upcomingActivities
                        .slice(0, 5)
                        .map((activity: any) => (
                          <tr
                            key={activity.Activity_ID}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {activity.Activity_Name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(activity.Activity_Date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {activity.Activity_Time
                                ? activity.Activity_Time.substring(0, 5) + " น."
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {activity.Activity_Location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {activity.expected_participants || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {activity.checked_in_count || 0}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Report Problem Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">รายงานปัญหา</h3>

              {reportSent ? (
                <div className="text-center py-8">
                  <div className="text-green-500 text-5xl mb-4">✓</div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">ส่งรายงานเรียบร้อยแล้ว</p>
                  <p className="text-sm text-gray-600">ขอบคุณที่แจ้งปัญหา เจ้าหน้าที่จะดำเนินการแก้ไข</p>
                  <button
                    onClick={() => { setShowReportModal(false); setReportSent(false); setReportText(''); setReportActivity(''); }}
                    className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">กิจกรรมที่พบปัญหา</label>
                    <select
                      value={reportActivity}
                      onChange={(e) => setReportActivity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    >
                      <option value="">เลือกกิจกรรม</option>
                      {stats?.upcomingActivities?.map((a: any) => (
                        <option key={a.Activity_ID} value={a.Activity_ID}>{a.Activity_Name}</option>
                      ))}
                    </select>
                  </div>
                  {reportError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{reportError}</div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดปัญหา</label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      rows={5}
                      placeholder="อธิบายปัญหาที่พบ..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!reportText.trim() || !reportActivity) return;
                        setReportSubmitting(true);
                        setReportError('');
                        try {
                          const res = await reportsAPI.create({
                            Activity_ID: reportActivity,
                            Report_Text: reportText.trim(),
                          });
                          if (res.success) {
                            setReportSent(true);
                          } else {
                            setReportError(res.message || 'ส่งรายงานไม่สำเร็จ');
                          }
                        } catch (err) {
                          setReportError(err instanceof Error ? err.message : 'ส่งรายงานไม่สำเร็จ');
                        } finally {
                          setReportSubmitting(false);
                        }
                      }}
                      disabled={!reportText.trim() || !reportActivity || reportSubmitting}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {reportSubmitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
                    </button>
                    <button
                      onClick={() => { setShowReportModal(false); setReportText(''); setReportActivity(''); setReportError(''); }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
