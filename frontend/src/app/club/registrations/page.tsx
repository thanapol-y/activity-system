'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI } from '@/lib/api';
import { Activity, Registration } from '@/types';

export default function ClubRegistrationsPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [search, setSearch] = useState('');

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

  const loadRegistrations = useCallback(async (activityId: string) => {
    try {
      setLoadingRegs(true);
      const response = await activitiesAPI.getRegistrations(activityId);
      if (response.success && response.data) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadRegistrations(selectedActivityId);
    } else {
      setRegistrations([]);
    }
  }, [selectedActivityId, loadRegistrations]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filtered = registrations.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.Student_ID?.toLowerCase().includes(s) ||
      (r as any).Student_Name?.toLowerCase().includes(s)
    );
  });

  const checkedInCount = registrations.filter((r) => r.Has_CheckedIn).length;

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายชื่อผู้ลงทะเบียน</h1>
          <p className="text-gray-600">ดูรายชื่อนักศึกษาที่ลงทะเบียนในแต่ละกิจกรรม</p>
        </div>

        {/* Activity Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกกิจกรรม</label>
          <select
            value={selectedActivityId}
            onChange={(e) => { setSelectedActivityId(e.target.value); setSearch(''); }}
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

        {selectedActivityId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm text-gray-500">ลงทะเบียน</p>
                <p className="text-2xl font-bold text-[#2B4C8C]">{registrations.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm text-gray-500">เช็คอินแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm text-gray-500">ยังไม่เช็คอิน</p>
                <p className="text-2xl font-bold text-yellow-600">{registrations.length - checkedInCount}</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหารหัสนักศึกษาหรือชื่อ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </>
        )}

        {/* Results */}
        {!selectedActivityId ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-4 text-gray-500">กรุณาเลือกกิจกรรมเพื่อดูรายชื่อ</p>
          </div>
        ) : loadingRegs ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <p className="text-gray-500">ไม่พบรายชื่อผู้ลงทะเบียน</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่ลงทะเบียน</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((reg, i) => (
                    <tr key={reg.Student_ID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{reg.Student_ID}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{(reg as any).Student_Name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(reg.Registration_Date)}</td>
                      <td className="px-4 py-3 text-center">
                        {reg.Has_CheckedIn ? (
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">เช็คอินแล้ว</span>
                        ) : reg.Registration_Status === 'cancelled' ? (
                          <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">ยกเลิก</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">ลงทะเบียนแล้ว</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
