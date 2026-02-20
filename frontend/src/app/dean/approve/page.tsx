'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AlertModal from '@/components/AlertModal';
import { activitiesAPI } from '@/lib/api';
import { Activity, ActivityStatus } from '@/types';

export default function DeanApprovePage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  React.useEffect(() => { document.title = 'ระบบลงทะเบียน – อนุมัติกิจกรรม'; }, []);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll({ status: ActivityStatus.PENDING, limit: 100 });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) + ' น.' : '-';
  };

  const handleViewDetail = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleApprove = async (activity: Activity) => {
    try {
      setProcessing(true);
      await activitiesAPI.approve(activity.Activity_ID);
      setMessage({ type: 'success', text: `อนุมัติกิจกรรม "${activity.Activity_Name}" เรียบร้อยแล้ว` });
      setShowAlertModal(true);
      setShowDetailModal(false);
      loadActivities();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'ไม่สามารถอนุมัติได้' });
      setShowAlertModal(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setRejectReason('');
    setShowRejectModal(true);
    setShowDetailModal(false);
  };

  const confirmReject = async () => {
    if (!selectedActivity) return;
    try {
      setProcessing(true);
      await activitiesAPI.reject(selectedActivity.Activity_ID, rejectReason);
      setMessage({ type: 'success', text: `ปฏิเสธกิจกรรม "${selectedActivity.Activity_Name}" เรียบร้อยแล้ว` });
      setShowAlertModal(true);
      setShowRejectModal(false);
      loadActivities();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'ไม่สามารถปฏิเสธได้' });
      setShowAlertModal(true);
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">อนุมัติกิจกรรม</h1>
          <p className="text-gray-600">ตรวจสอบรายละเอียดแล้วกดปุ่ม "อนุมัติ" หรือ "ปฏิเสธ" เพื่อดำเนินการกับกิจกรรมที่รออยู่</p>
        </div>

        {/* Alert Modal */}
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          type={message?.type || 'error'}
          message={message?.text || ''}
        />

        {/* Pending count */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">กิจกรรมที่รออนุมัติ</p>
                <p className="text-2xl font-bold text-gray-800">{activities.length} รายการ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-16">
            <svg className="mx-auto h-16 w-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-600 text-lg">ไม่มีกิจกรรมที่รออนุมัติ</p>
          </div>
        ) : (
          /* Activity Cards */
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.Activity_ID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">{activity.Activity_Name}</h3>
                        <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                          รออนุมัติ
                        </span>
                      </div>

                      {activity.Activity_Details && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.Activity_Details}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-700">วันจัด: {formatDate(activity.Activity_Date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">เวลา: {formatTime(activity.Activity_Time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">สถานที่: {activity.Activity_Location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">รับ {activity.Maximum_Capacity} คน</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-purple-700 font-semibold">{activity.Activity_Hours || 3} ชั่วโมงกิจกรรม</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-gray-700">ประเภท: {activity.Activity_Type_Name || 'ทั่วไป'}</span>
                        </div>
                      </div>
                      {activity.Deadline && (
                        <p className="mt-2 text-xs text-orange-600 font-medium">ปิดรับลงทะเบียน: {formatDate(activity.Deadline)}</p>
                      )}

                      {activity.Activity_Head_Name && (
                        <p className="mt-3 text-xs text-gray-500">
                          เสนอโดย: {activity.Activity_Head_Name}
                          {activity.Activity_Head_Email && ` (${activity.Activity_Head_Email})`}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row md:flex-col gap-2">
                      <button
                        onClick={() => handleViewDetail(activity)}
                        className="px-4 py-2 text-sm font-medium text-[#2B4C8C] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleApprove(activity)}
                        disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleRejectClick(activity)}
                        disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดกิจกรรม</h3>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">ชื่อกิจกรรม</label>
                  <p className="text-gray-800 font-semibold">{selectedActivity.Activity_Name}</p>
                </div>
                {selectedActivity.Activity_Details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">รายละเอียด</label>
                    <p className="text-gray-800">{selectedActivity.Activity_Details}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">วันที่จัดกิจกรรม</label>
                    <p className="text-gray-800">{formatDate(selectedActivity.Activity_Date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">เวลา</label>
                    <p className="text-gray-800">{formatTime(selectedActivity.Activity_Time)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">สถานที่</label>
                  <p className="text-gray-800">{selectedActivity.Activity_Location}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">จำนวนรับ</label>
                    <p className="text-gray-800">{selectedActivity.Maximum_Capacity} คน</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ประเภทกิจกรรม</label>
                    <p className="text-gray-800">{selectedActivity.Activity_Type_Name || 'ทั่วไป'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ชั่วโมงกิจกรรม</label>
                    <p className="text-gray-800 font-semibold text-[#2B4C8C]">{selectedActivity.Activity_Hours || 3} ชั่วโมง</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ปิดรับลงทะเบียน</label>
                    <p className="text-gray-800">{selectedActivity.Deadline ? formatDate(selectedActivity.Deadline) : '-'}</p>
                  </div>
                </div>
                {selectedActivity.Activity_Head_Name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">เสนอโดย</label>
                    <p className="text-gray-800">{selectedActivity.Activity_Head_Name}
                      {selectedActivity.Activity_Head_Email && <span className="text-gray-500 text-sm"> ({selectedActivity.Activity_Head_Email})</span>}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedActivity)}
                  disabled={processing}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                </button>
                <button
                  onClick={() => handleRejectClick(selectedActivity)}
                  disabled={processing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">ปฏิเสธกิจกรรม</h3>
              <p className="text-gray-600 text-sm mb-4">
                กิจกรรม: <strong>{selectedActivity.Activity_Name}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลในการปฏิเสธ (ไม่บังคับ)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="กรอกเหตุผล..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmReject}
                  disabled={processing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
