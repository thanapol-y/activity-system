'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI } from '@/lib/api';
import { Activity, Registration } from '@/types';

export default function ActivityHeadStudentsPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (!activityId) {
      setRegistrations([]);
      return;
    }
    try {
      setLoadingRegs(true);
      const response = await activitiesAPI.getRegistrations(activityId);
      if (response.success && response.data) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedActivityId(id);
    setSearchTerm('');
    loadRegistrations(id);
  };

  const selectedActivity = activities.find((a) => a.Activity_ID === selectedActivityId);

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      reg.Student_ID?.toLowerCase().includes(term) ||
      (reg as any).Student_Name?.toLowerCase().includes(term) ||
      reg.Activity_Name?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }) + ' น.';
  };

  // Stats
  const totalRegistered = registrations.length;
  const totalCheckedIn = registrations.filter((r) => r.Has_CheckedIn).length;

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการนักศึกษา</h1>
          <p className="text-gray-600">ดูรายชื่อผู้ลงทะเบียนและสถานะการเข้าร่วมกิจกรรม</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Activity Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">เลือกกิจกรรม</label>
              <select
                value={selectedActivityId}
                onChange={handleActivityChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="">-- เลือกกิจกรรม --</option>
                {activities.map((activity) => (
                  <option key={activity.Activity_ID} value={activity.Activity_ID}>
                    {activity.Activity_Name} ({formatDate(activity.Activity_Date)})
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Info Card */}
            {selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{selectedActivity.Activity_Name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">วันที่:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedActivity.Activity_Date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">เวลา:</span>{' '}
                    <span className="text-gray-800">
                      {selectedActivity.Activity_Time ? selectedActivity.Activity_Time.substring(0, 5) + ' น.' : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">สถานที่:</span>{' '}
                    <span className="text-gray-800">{selectedActivity.Activity_Location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">ลงทะเบียน:</span>{' '}
                    <span className="text-gray-800">
                      {totalRegistered} / {selectedActivity.Maximum_Capacity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {selectedActivityId && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">ผู้ลงทะเบียน</p>
                  <p className="text-2xl font-bold text-[#2B4C8C]">{totalRegistered}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">เข้าร่วมแล้ว</p>
                  <p className="text-2xl font-bold text-green-600">{totalCheckedIn}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">ยังไม่เช็คอิน</p>
                  <p className="text-2xl font-bold text-yellow-600">{totalRegistered - totalCheckedIn}</p>
                </div>
              </div>
            )}

            {/* Search */}
            {selectedActivityId && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหารหัสหรือชื่อนักศึกษา..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Registrations Table */}
            {selectedActivityId && (
              loadingRegs ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
                  <p className="mt-4 text-gray-600">กำลังโหลดรายชื่อ...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm text-center py-12">
                  <p className="text-gray-600">ไม่พบข้อมูลผู้ลงทะเบียน</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลงทะเบียนเมื่อ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เช็คอินเมื่อ</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRegistrations.map((reg, index) => (
                          <tr key={`${reg.Student_ID}-${reg.Activity_ID}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{reg.Student_ID}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{(reg as any).Student_Name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {reg.Registration_Date ? formatDateTime(reg.Registration_Date) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {reg.Has_CheckedIn ? (
                                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                  เข้าร่วมแล้ว
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                  ยังไม่เช็คอิน
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {reg.CheckIn_Time ? formatDateTime(reg.CheckIn_Time) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      พบนักศึกษาทั้งหมด {filteredRegistrations.length} คน
                    </p>
                  </div>
                </div>
              )
            )}

            {/* No activity selected */}
            {!selectedActivityId && (
              <div className="bg-white rounded-lg shadow-sm text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">กรุณาเลือกกิจกรรมเพื่อดูรายชื่อผู้ลงทะเบียน</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
