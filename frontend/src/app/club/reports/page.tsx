'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { statisticsAPI, registrationAPI } from '@/lib/api';
import { DashboardStats, CheckIn } from '@/types';

export default function ClubReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getClub();
      if (response.success && response.data) {
        setStats(response.data);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายงานและประวัติ</h1>
          <p className="text-gray-600">ดูสถิติการเช็คอินและประวัติกิจกรรมที่ได้รับมอบหมาย</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">กิจกรรมที่ได้รับมอบหมาย</p>
                <p className="text-3xl font-bold text-[#2B4C8C]">
                  {(stats as any)?.summary?.assignedActivities || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">การเช็คอินทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">{stats?.summary.totalCheckIns || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">กิจกรรมที่กำลังจะถึง</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.upcomingActivities?.length || 0}</p>
              </div>
            </div>

            {/* Recent Check-ins Chart */}
            {stats?.recentCheckIns && stats.recentCheckIns.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติการเช็คอินรายวัน</h3>
                <div className="space-y-3">
                  {stats.recentCheckIns.map((item) => {
                    const maxCount = Math.max(...stats.recentCheckIns!.map((i) => i.count), 1);
                    const percent = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={item.date}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{formatDate(item.date)}</span>
                          <span className="text-sm font-semibold text-gray-800">{item.count} คน</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-[#2B4C8C] h-3 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Activities */}
            {stats?.upcomingActivities && stats.upcomingActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมที่กำลังจะถึง</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.upcomingActivities.map((activity: any) => (
                        <tr key={activity.Activity_ID} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{activity.Activity_Name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(activity.Activity_Date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {activity.Activity_Time ? activity.Activity_Time.substring(0, 5) + ' น.' : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{activity.Activity_Location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!stats?.upcomingActivities?.length && !stats?.recentCheckIns?.length && (
              <div className="bg-white rounded-lg shadow-sm text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">ยังไม่มีข้อมูลรายงาน</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
