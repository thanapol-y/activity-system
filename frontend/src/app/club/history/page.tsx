'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { activitiesAPI, registrationAPI } from '@/lib/api';
import { Activity, CheckIn } from '@/types';

interface AllCheckIn extends CheckIn {
  Activity_Name?: string;
  Activity_Type_Name?: string;
}

export default function ClubHistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allCheckins, setAllCheckins] = useState<AllCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'activity' | 'type'>('time');
  const [search, setSearch] = useState('');

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const actResponse = await activitiesAPI.getAll({ limit: 100 });
      if (actResponse.success && actResponse.data) {
        setActivities(actResponse.data);

        // Load check-ins for all activities
        const allCi: AllCheckIn[] = [];
        for (const act of actResponse.data) {
          try {
            const ciResponse = await registrationAPI.getCheckInHistory(act.Activity_ID);
            if (ciResponse.success && ciResponse.data) {
              ciResponse.data.forEach((ci: CheckIn) => {
                allCi.push({
                  ...ci,
                  Activity_Name: act.Activity_Name,
                  Activity_Type_Name: act.Activity_Type_Name,
                });
              });
            }
          } catch {
            // skip failed
          }
        }
        setAllCheckins(allCi);
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
    let filtered = [...allCheckins];

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter((ci) =>
        ci.Student_ID?.toLowerCase().includes(s) ||
        ci.Student_Name?.toLowerCase().includes(s) ||
        ci.Activity_Name?.toLowerCase().includes(s)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.CheckIn_Time).getTime() - new Date(a.CheckIn_Time).getTime();
      } else if (sortBy === 'activity') {
        return (a.Activity_Name || '').localeCompare(b.Activity_Name || '');
      } else if (sortBy === 'type') {
        return (a.Activity_Type_Name || '').localeCompare(b.Activity_Type_Name || '');
      }
      return 0;
    });

    return filtered;
  };

  const displayed = getFilteredAndSorted();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ประวัติการเช็คอินทั้งหมด</h1>
          <p className="text-gray-600">แสดงข้อมูลการเช็คอินทั้งหมด เรียงจากล่าสุดก่อน สามารถค้นหาและเรียงลำดับได้ตามต้องการ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">เช็คอินทั้งหมด</p>
            <p className="text-2xl font-bold text-[#2B4C8C]">{allCheckins.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500">กิจกรรมทั้งหมด</p>
            <p className="text-2xl font-bold text-green-600">{new Set(allCheckins.map(c => c.Activity_ID)).size}</p>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา (รหัสนักศึกษา, ชื่อ, หรือกิจกรรม)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="พิมพ์เพื่อค้นหา..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'time' as const, label: 'เวลาเช็คอิน (ล่าสุดก่อน)' },
                { key: 'activity' as const, label: 'ชื่อกิจกรรม' },
                { key: 'type' as const, label: 'หมวดหมู่กิจกรรม' },
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
            <p className="text-gray-500">{allCheckins.length === 0 ? 'ยังไม่มีข้อมูลการเช็คอิน' : 'ไม่พบข้อมูลที่ค้นหา'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">กิจกรรม</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลาเช็คอิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayed.map((ci, i) => (
                    <tr key={`${ci.Student_ID}-${ci.Activity_ID}-${ci.CheckIn_Time}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ci.Activity_Name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">{ci.Activity_Type_Name || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ci.Student_ID}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ci.Student_Name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(ci.CheckIn_Time)}</td>
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
