'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AlertModal from '@/components/AlertModal';
import { registrationAPI } from '@/lib/api';
import { Registration } from '@/types';

export default function MyActivitiesPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Registration | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [loadingQR, setLoadingQR] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [checkInData, setCheckInData] = useState<{ activityName: string; hours: number } | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => { document.title = 'ระบบลงทะเบียน – กิจกรรมของฉัน'; }, []);

  const [filter, setFilter] = useState<'waiting' | 'completed'>('waiting');



  useEffect(() => {

    loadRegistrations();

  }, []);



  const loadRegistrations = async () => {

    try {

      setLoading(true);

      const response = await registrationAPI.getMyRegistrations();

      if (response.success && response.data) {

        setRegistrations(response.data);

      }

    } catch (error) {

      console.error('Error loading registrations:', error);

      setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลได้' });
      setShowAlertModal(true);

    } finally {

      setLoading(false);

    }

  };



  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPollingCheckIn = useCallback((activityId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await registrationAPI.getCheckInStatus(activityId);
        if (res.success && res.data?.checkedIn) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          setShowQRModal(false);
          setCheckInData({
            activityName: res.data.Activity_Name,
            hours: res.data.Activity_Hours || 3,
          });
          setShowCheckInSuccess(true);
          loadRegistrations();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleViewQR = async (registration: Registration) => {
    setSelectedActivity(registration);
    setShowQRModal(true);
    setLoadingQR(true);

    try {
      const response = await registrationAPI.getQRCode(registration.Activity_ID);
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        // Start polling for check-in status
        startPollingCheckIn(registration.Activity_ID);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'ไม่สามารถโหลด QR Code ได้' });
      setShowAlertModal(true);
      setShowQRModal(false);
    } finally {
      setLoadingQR(false);
    }
  };



  const handleCancelClick = (registration: Registration) => {

    setSelectedActivity(registration);

    setShowCancelModal(true);

  };



  const confirmCancel = async () => {

    if (!selectedActivity) return;



    try {

      setCancelling(true);

      await registrationAPI.cancel(selectedActivity.Activity_ID);

      setMessage({ type: 'success', text: 'ยกเลิกการลงทะเบียนสำเร็จ' });
      setShowAlertModal(true);
      setShowCancelModal(false);
      loadRegistrations();

    } catch (error) {

      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'ไม่สามารถยกเลิกได้',
      });
      setShowAlertModal(true);

    } finally {

      setCancelling(false);

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



  const getFilteredRegistrations = () => {
    // Only show registered (not cancelled) registrations
    const activeRegs = registrations.filter((reg) => reg.Registration_Status !== 'cancelled');

    if (filter === 'waiting') {
      return activeRegs.filter((reg) => !reg.Has_CheckedIn);
    } else {
      return activeRegs.filter((reg) => reg.Has_CheckedIn);
    }
  };



  const filteredRegistrations = getFilteredRegistrations();



  if (!user) {

    return null;

  }



  return (

    <div className="min-h-screen flex flex-col bg-gray-50">

      <Navbar />



      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">กิจกรรมของฉัน</h1>

          <p className="text-sm md:text-base text-gray-600">ดูกิจกรรมที่คุณเข้าร่วมแล้ว กด "QR Code" เพื่อแสดง QR ให้เจ้าหน้าที่สแกนในวันงาน หรือกด "ยกเลิก" หากไม่ต้องการเข้าร่วมแล้ว</p>

        </div>



        {/* Alert Modal */}
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          type={message?.type || 'error'}
          message={message?.text || ''}
        />



        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('waiting')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                filter === 'waiting'
                  ? 'bg-[#2B4C8C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              รอเข้าร่วม ({registrations.filter(r => r.Registration_Status !== 'cancelled' && !r.Has_CheckedIn).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              เข้าร่วมแล้ว ({registrations.filter(r => r.Registration_Status !== 'cancelled' && r.Has_CheckedIn).length})
            </button>
          </div>
        </div>



        {/* Loading State */}

        {loading ? (

          <div className="text-center py-12">

            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>

            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>

          </div>

        ) : (

          <>

            {/* Activities List */}

            {filteredRegistrations.length === 0 ? (

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

                <p className="mt-4 text-gray-600">ไม่มีกิจกรรมที่ลงทะเบียนไว้</p>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredRegistrations.map((registration) => (

                  <div

                    key={registration.Activity_ID}

                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"

                  >

                    <div className="p-6">

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div className="flex-1">

                          <h3 className="text-xl font-semibold text-gray-800 mb-2">

                            {registration.Activity_Name}

                          </h3>



                          {registration.Activity_Details && (

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">

                              {registration.Activity_Details}

                            </p>

                          )}



                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            <div className="flex items-center space-x-2 text-sm">

                              <svg

                                className="w-5 h-5 text-gray-400"

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

                              <span className="text-gray-700">

                                {registration.Activity_Date ? formatDate(registration.Activity_Date) : '-'}

                              </span>

                            </div>



                            <div className="flex items-center space-x-2 text-sm">

                              <svg

                                className="w-5 h-5 text-gray-400"

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

                              <span className="text-gray-700">

                                {registration.Activity_Time ? formatTime(registration.Activity_Time) : '-'}

                              </span>

                            </div>



                            <div className="flex items-center space-x-2 text-sm">

                              <svg

                                className="w-5 h-5 text-gray-400"

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

                              <span className="text-gray-700">{registration.Activity_Location || '-'}</span>

                            </div>



                            <div className="flex items-center space-x-2 text-sm">

                              {registration.Has_CheckedIn ? (

                                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">

                                  ✓ เข้าร่วมแล้ว {registration.Activity_Hours ? `(${registration.Activity_Hours} ชั่วโมง)` : ''}

                                </span>

                              ) : registration.Activity_Date && new Date(registration.Activity_Date) < new Date() ? (

                                <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">

                                  เลยเวลาสแกนเข้าร่วมกิจกรรมแล้ว

                                </span>

                              ) : (

                                <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">

                                  รอเข้าร่วม

                                </span>

                              )}

                            </div>

                          </div>

                        </div>



                        <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                          <button
                            onClick={() => { setSelectedActivity(registration); setShowDetailModal(true); }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            ดูรายละเอียด
                          </button>
                          {registration.Has_CheckedIn ? (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium whitespace-nowrap text-center">
                              ✓ เข้าร่วมแล้ว
                            </span>
                          ) : registration.Activity_Date && new Date(registration.Activity_Date) < new Date() ? (
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium whitespace-nowrap text-center">
                              เลยเวลาแล้ว
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleViewQR(registration)}
                                className="px-4 py-2 bg-[#2B4C8C] hover:bg-[#1e3563] text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                QR Code
                              </button>
                              <button
                                onClick={() => handleCancelClick(registration)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                ยกเลิก
                              </button>
                            </>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </>

        )}

      </main>



      <Footer />



      {/* QR Code Modal */}

      {showQRModal && selectedActivity && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">

            <div className="p-6">

              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">

                QR Code เข้าร่วมกิจกรรม

              </h3>



              <div className="mb-4">

                <h4 className="font-semibold text-gray-800 mb-2">{selectedActivity.Activity_Name}</h4>

                <p className="text-sm text-gray-600">

                  วันที่: {selectedActivity.Activity_Date ? formatDate(selectedActivity.Activity_Date) : '-'}

                </p>

              </div>



              {loadingQR ? (

                <div className="flex justify-center py-12">

                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B4C8C]"></div>

                </div>

              ) : qrCode ? (

                <div className="flex justify-center mb-4">

                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />

                </div>

              ) : (

                <p className="text-center text-red-600 py-8">ไม่สามารถโหลด QR Code ได้</p>

              )}



              <p className="text-xs text-center text-gray-500 mb-2">
                แสดง QR Code นี้ให้เจ้าหน้าที่สแกนในวันงาน
              </p>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 mb-4 py-2 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2B4C8C]"></div>
                <p className="text-xs text-blue-700 font-medium">กำลังรอการสแกนจากเจ้าหน้าที่...</p>
              </div>

              <button
                onClick={() => { stopPolling(); setShowQRModal(false); }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                ปิด
              </button>

            </div>

          </div>

        </div>

      )}



      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#2B4C8C] to-[#3B5998] p-5 rounded-t-lg relative">
              <h3 className="text-xl font-bold text-white pr-20">{selectedActivity.Activity_Name}</h3>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                {selectedActivity.Activity_Type_Name || 'ทั่วไป'}
              </span>
              <div className="absolute top-4 right-4 bg-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg">
                <span className="text-[#2B4C8C] font-bold text-lg leading-none">{selectedActivity.Activity_Hours || 3}</span>
                <span className="text-[#2B4C8C] text-[10px] leading-none">ชั่วโมง</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">รายละเอียดกิจกรรม</p>
                <p className="text-gray-800">{selectedActivity.Activity_Details || 'ไม่มีรายละเอียด'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">วันที่จัดกิจกรรม</p>
                  <p className="text-gray-800">{selectedActivity.Activity_Date ? formatDate(selectedActivity.Activity_Date) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">เวลา</p>
                  <p className="text-gray-800">{selectedActivity.Activity_Time ? formatTime(selectedActivity.Activity_Time) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">สถานที่</p>
                  <p className="text-gray-800">{selectedActivity.Activity_Location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ชั่วโมงกิจกรรม</p>
                  <p className="text-gray-800 font-semibold text-[#2B4C8C]">{selectedActivity.Activity_Hours || 3} ชั่วโมง</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">สถานะเช็คอิน</p>
                  {selectedActivity.Has_CheckedIn ? (
                    <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">✓ เข้าร่วมแล้ว</span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">รอเข้าร่วม</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">วันที่ลงทะเบียน</p>
                  <p className="text-gray-800">{selectedActivity.Registration_Date ? formatDate(selectedActivity.Registration_Date) : '-'}</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ปิด
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); handleViewQR(selectedActivity); }}
                  className="flex-1 px-4 py-2 bg-[#2B4C8C] hover:bg-[#1e3563] text-white rounded-lg transition-colors"
                >
                  ดู QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}

      {showCancelModal && selectedActivity && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">

            <div className="p-6">

              <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการยกเลิก</h3>



              <p className="text-gray-600 mb-6">

                คุณต้องการยกเลิกการลงทะเบียน

                <br />

                <span className="font-semibold">{selectedActivity.Activity_Name}</span>

                <br />

                ใช่หรือไม่?

              </p>



              <div className="flex space-x-3">

                <button

                  onClick={() => setShowCancelModal(false)}

                  disabled={cancelling}

                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"

                >

                  ยกเลิก

                </button>

                <button

                  onClick={confirmCancel}

                  disabled={cancelling}

                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"

                >

                  {cancelling ? 'กำลังยกเลิก...' : 'ยืนยัน'}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* Check-in Success Popup */}
      {showCheckInSuccess && checkInData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[fadeIn_0.3s_ease]">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">เช็คอินสำเร็จ!</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-800 font-semibold text-lg mb-2">{checkInData.activityName}</p>
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">คุณได้รับ</p>
                <p className="text-3xl font-bold text-green-600">{checkInData.hours}</p>
                <p className="text-sm text-gray-600">ชั่วโมงกิจกรรม</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">ระบบบันทึกการเข้าร่วมกิจกรรมของคุณเรียบร้อยแล้ว</p>
              <button
                onClick={() => { setShowCheckInSuccess(false); setCheckInData(null); }}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}

