'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI, registrationAPI } from '@/lib/api';
import { Activity, ActivityStatus, Registration } from '@/types';

export default function StudentActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActivities();
    loadMyRegistrations();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, selectedType, activities]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll({
        status: ActivityStatus.APPROVED,
        limit: 100,
      });
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRegistrations = async () => {
    try {
      const response = await registrationAPI.getMyRegistrations();
      if (response.success && response.data) {
        const ids = new Set<string>(response.data.filter((r: Registration) => r.Registration_Status === 'registered').map((r: Registration) => r.Activity_ID));
        setRegisteredIds(ids);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.Activity_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.Activity_Details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((activity) => activity.Activity_Type_ID === selectedType);
    }

    setFilteredActivities(filtered);
  };

  const handleRegister = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const confirmRegister = async () => {
    if (!selectedActivity) return;

    try {
      setRegistering(true);
      await registrationAPI.register(selectedActivity.Activity_ID);
      setMessage({ type: 'success', text: 'ลงทะเบียนสำเร็จ!' });
      setShowModal(false);
      setRegisteredIds(prev => new Set(prev).add(selectedActivity.Activity_ID));
      loadActivities();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'ลงทะเบียนไม่สำเร็จ',
      });
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) + ' น.' : '-';
  };

  const getActivityTypes = () => {
    const typeMap = new Map<string, string>();
    activities.forEach((activity) => {
      if (activity.Activity_Type_ID) {
        typeMap.set(activity.Activity_Type_ID, activity.Activity_Type_Name || activity.Activity_Type_ID);
      }
    });
    return Array.from(typeMap.entries());
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">กิจกรรมทั้งหมด</h1>
          <p className="text-gray-600">ค้นหาและลงทะเบียนกิจกรรมที่คุณสนใจ</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหากิจกรรม
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ชื่อกิจกรรม..."
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

            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทกิจกรรม
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="">ทั้งหมด</option>
                {getActivityTypes().map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
            }}
            className="mt-4 text-sm text-[#2B4C8C] hover:underline"
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Activities Grid */}
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-4 text-gray-600">ไม่พบกิจกรรมที่ค้นหา</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.Activity_ID}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    {/* Activity Header */}
                    <div className="bg-gradient-to-r from-[#2B4C8C] to-[#3B5998] p-4">
                      <h3 className="text-white font-semibold text-lg line-clamp-2">
                        {activity.Activity_Name}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                        {activity.Activity_Type_Name || 'ทั่วไป'}
                      </span>
                    </div>

                    {/* Activity Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                          />
                        </svg>
                        <p className="text-gray-600 line-clamp-2">
                          {activity.Activity_Details || 'ไม่มีรายละเอียด'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                        <span className="text-gray-700">{formatDate(activity.Activity_Date)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700">{formatTime(activity.Activity_Time)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-700">{activity.Activity_Location}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                        <span className="text-gray-700">
                          {activity.Current_Registrations || 0} / {activity.Maximum_Capacity} คน
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 pt-0">
                      {registeredIds.has(activity.Activity_ID) ? (
                        <button
                          disabled
                          className="w-full bg-gray-400 text-white font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                        >
                          ✓ ลงทะเบียนแล้ว
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(activity)}
                          className="w-full bg-[#28A745] hover:bg-[#218838] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          ลงทะเบียน
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Registration Modal */}
      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการลงทะเบียน</h3>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">ชื่อกิจกรรม</label>
                  <p className="text-gray-800">{selectedActivity.Activity_Name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">วันที่</label>
                  <p className="text-gray-800">{formatDate(selectedActivity.Activity_Date)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">เวลา</label>
                  <p className="text-gray-800">{formatTime(selectedActivity.Activity_Time)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">สถานที่</label>
                  <p className="text-gray-800">{selectedActivity.Activity_Location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">จำนวนผู้เข้าร่วม</label>
                  <p className="text-gray-800">
                    {selectedActivity.Current_Registrations || 0} / {selectedActivity.Maximum_Capacity} คน
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={registering}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmRegister}
                  disabled={registering}
                  className="flex-1 px-4 py-2 bg-[#28A745] hover:bg-[#218838] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {registering ? 'กำลังลงทะเบียน...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
