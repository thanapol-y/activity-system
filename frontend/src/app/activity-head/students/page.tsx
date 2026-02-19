'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI } from '@/lib/api';
import { Activity, Registration } from '@/types';

interface AllRegistration extends Registration {
  Activity_Name_Full?: string;
  Activity_Type_Name_Full?: string;
  Student_Name_Full?: string;
}

export default function ActivityHeadStudentsPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<AllRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'activity' | 'status'>('date');

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll({ limit: 100 });
      if (response.success && response.data) {
        setActivities(response.data);

        const allRegs: AllRegistration[] = [];
        for (const act of response.data) {
          try {
            const regResponse = await activitiesAPI.getRegistrations(act.Activity_ID);
            if (regResponse.success && regResponse.data) {
              regResponse.data.forEach((reg: Registration) => {
                allRegs.push({
                  ...reg,
                  Activity_Name_Full: act.Activity_Name,
                  Activity_Type_Name_Full: act.Activity_Type_Name,
                  Student_Name_Full: (reg as any).Student_Name,
                });
              });
            }
          } catch {
            // skip failed
          }
        }
        setAllRegistrations(allRegs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getFilteredAndSorted = () => {
    let filtered = [...allRegistrations];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter((reg) =>
        reg.Student_ID?.toLowerCase().includes(s) ||
        reg.Student_Name_Full?.toLowerCase().includes(s) ||
        reg.Activity_Name_Full?.toLowerCase().includes(s)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.Registration_Date || '').getTime() - new Date(a.Registration_Date || '').getTime();
      } else if (sortBy === 'activity') {
        return (a.Activity_Name_Full || '').localeCompare(b.Activity_Name_Full || '');
      } else if (sortBy === 'status') {
        return (a.Has_CheckedIn ? 0 : 1) - (b.Has_CheckedIn ? 0 : 1);
      }
      return 0;
    });

    return filtered;
  };

  const displayed = getFilteredAndSorted();
  const totalCheckedIn = allRegistrations.filter((r) => r.Has_CheckedIn).length;

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">ผู้ลงทะเบียนทั้งหมด</h1>
          <p className="text-sm md:text-base text-gray-600">แสดงนักศึกษาที่ลงทะเบียนทั้งหมดทุกกิจกรรม สามารถค้นหาและเรียงลำดับได้ตามต้องการ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">กิจกรรมทั้งหมด</p>
            <p className="text-2xl font-bold text-[#2B4C8C]">{activities.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">ผู้ลงทะเบียนทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-600">{allRegistrations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">เข้าร่วมแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{totalCheckedIn}</p>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา (รหัสนักศึกษา, ชื่อ, หรือกิจกรรม)</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์เพื่อค้นหา..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'date' as const, label: 'วันที่ลงทะเบียน (ล่าสุดก่อน)' },
                { key: 'activity' as const, label: 'ชื่อกิจกรรม' },
                { key: 'status' as const, label: 'สถานะเช็คอิน' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    sortBy === opt.key
                      ? 'bg-[#2B4C8C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลทั้งหมด...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <p className="text-gray-500">{allRegistrations.length === 0 ? 'ยังไม่มีผู้ลงทะเบียน' : 'ไม่พบข้อมูลที่ค้นหา'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">กิจกรรม</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลงทะเบียนเมื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เช็คอินเมื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayed.map((reg, i) => (
                    <tr key={`${reg.Student_ID}-${reg.Activity_ID}-${i}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{reg.Activity_Name_Full || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{reg.Student_ID}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{reg.Student_Name_Full || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{reg.Registration_Date ? formatDateTime(reg.Registration_Date) : '-'}</td>
                      <td className="px-4 py-3">
                        {reg.Has_CheckedIn ? (
                          <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">เข้าร่วมแล้ว</span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">ยังไม่เช็คอิน</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{reg.CheckIn_Time ? formatDateTime(reg.CheckIn_Time) : '-'}</td>
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
