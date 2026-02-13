'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI, registrationAPI } from '@/lib/api';
import { Activity, CheckIn } from '@/types';

export default function ClubHistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll({ limit: 100 });
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const loadCheckins = useCallback(async (activityId: string) => {
    try {
      setLoadingCheckins(true);
      const response = await registrationAPI.getCheckInHistory(activityId);
      if (response.success && response.data) {
        setCheckins(response.data);
      }
    } catch (error) {
      console.error('Error loading checkins:', error);
    } finally {
      setLoadingCheckins(false);
    }
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadCheckins(selectedActivityId);
    } else {
      setCheckins([]);
    }
  }, [selectedActivityId, loadCheckins]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ประวัติการเช็คอิน</h1>
          <p className="text-gray-600">ดูประวัติการเช็คอินนักศึกษาแต่ละกิจกรรม</p>
        </div>

        {/* Activity Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกกิจกรรม</label>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">-- เลือกกิจกรรม --</option>
            {activities.map((act) => (
              <option key={act.Activity_ID} value={act.Activity_ID}>
                {act.Activity_Name}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {!selectedActivityId ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-500">กรุณาเลือกกิจกรรมเพื่อดูประวัติเช็คอิน</p>
          </div>
        ) : loadingCheckins ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : checkins.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <p className="text-gray-500">ยังไม่มีการเช็คอินในกิจกรรมนี้</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <p className="text-sm text-gray-600">
                ทั้งหมด <strong className="text-[#2B4C8C]">{checkins.length}</strong> คน
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาเช็คอิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {checkins.map((ci, i) => (
                      <tr key={`${ci.Student_ID}-${ci.CheckIn_Time}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{ci.Student_ID}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{ci.Student_Name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(ci.CheckIn_Time)}</td>
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
