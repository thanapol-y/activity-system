'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { registrationAPI } from '@/lib/api';
import { Registration } from '@/types';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'attended' | 'missed'>('all');

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await registrationAPI.getActivityHistory();
      if (response.success && response.data) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isCheckedIn = (r: Registration) => Boolean(Number(r.Has_CheckedIn));

  const filtered = registrations.filter((r) => {
    if (filter === 'attended') return isCheckedIn(r);
    if (filter === 'missed') return !isCheckedIn(r);
    return true;
  });

  const attendedCount = registrations.filter((r) => isCheckedIn(r)).length;
  const missedCount = registrations.filter((r) => !isCheckedIn(r)).length;

  const attendedRegs = registrations.filter((r) => isCheckedIn(r));
  const totalAttendedHours = attendedRegs.reduce((sum, r) => sum + (r.Activity_Hours || 0), 0);

  const hoursByType = useMemo(() => {
    const map = new Map<string, { name: string; hours: number; count: number }>();
    attendedRegs.forEach((r) => {
      const typeName = r.Activity_Type_Name || 'ทั่วไป';
      const existing = map.get(typeName) || { name: typeName, hours: 0, count: 0 };
      existing.hours += r.Activity_Hours || 0;
      existing.count++;
      map.set(typeName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [attendedRegs]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ประวัติการเข้าร่วมกิจกรรม</h1>
          <p className="text-gray-600">ดูสถานะการเข้าร่วมกิจกรรมทั้งหมด สีเขียว = เข้าร่วมแล้ว, สีแดง = ยังไม่ได้เข้าร่วม</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">ลงทะเบียนทั้งหมด</p>
            <p className="text-2xl font-bold text-[#2B4C8C]">{registrations.length}</p>
            <p className="text-xs text-gray-400">กิจกรรม</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">เข้าร่วมแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
            <p className="text-xs text-gray-400">กิจกรรม</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">ไม่ได้เข้าร่วม</p>
            <p className="text-2xl font-bold text-red-600">{missedCount}</p>
            <p className="text-xs text-gray-400">กิจกรรม</p>
          </div>
          <div className="bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] rounded-lg shadow-sm p-4 text-center text-white">
            <p className="text-sm opacity-80">ชั่วโมงกิจกรรมรวม</p>
            <p className="text-2xl font-bold">{totalAttendedHours}</p>
            <p className="text-xs opacity-70">ชั่วโมง (เฉพาะที่เข้าร่วม)</p>
          </div>
        </div>

        {/* Hours by Activity Type */}
        {!loading && hoursByType.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">ชั่วโมงกิจกรรมแยกตามประเภท</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hoursByType.map((t) => (
                <div key={t.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-12 h-12 bg-[#2B4C8C] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{t.hours}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.count} กิจกรรม · {t.hours} ชั่วโมง</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all' as const, label: 'ทั้งหมด' },
            { key: 'attended' as const, label: 'เข้าร่วมแล้ว' },
            { key: 'missed' as const, label: 'ไม่ได้เข้าร่วม' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-[#2B4C8C] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <p className="text-gray-500">ไม่พบประวัติกิจกรรม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => (
              <div key={`${reg.Activity_ID}-${reg.Student_ID}`} className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{reg.Activity_Name}</h3>
                      {reg.Activity_Hours ? (
                        <span className="bg-[#2B4C8C] text-white text-xs font-bold px-2 py-0.5 rounded-full">{reg.Activity_Hours} ชม.</span>
                      ) : null}
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      {reg.Activity_Type_Name && (
                        <p className="text-xs text-[#2B4C8C] font-medium">{reg.Activity_Type_Name}</p>
                      )}
                      <p>วันที่: {formatDate(reg.Activity_Date)}</p>
                      {reg.Activity_Location && <p>สถานที่: {reg.Activity_Location}</p>}
                      <p>ลงทะเบียนเมื่อ: {formatDate(reg.Registration_Date)}</p>
                      {isCheckedIn(reg) && reg.CheckIn_Time && (
                        <p className="text-green-600">เช็คอินเมื่อ: {formatDate(reg.CheckIn_Time)}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    isCheckedIn(reg)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCheckedIn(reg) ? 'เข้าร่วมแล้ว' : 'ไม่ได้เข้าร่วม'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
