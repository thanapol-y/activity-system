'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AlertModal from '@/components/AlertModal';
import { activitiesAPI } from '@/lib/api';
import { Activity, ActivityStatus, CreateActivityForm, ActivityType } from '@/types';

const emptyForm: CreateActivityForm = {
  Activity_Name: '',
  Activity_Details: '',
  Academic_Year: new Date().getFullYear() + 543,
  Activity_Type_ID: '',
  Activity_Date: '',
  Activity_Time: '',
  Activity_Location: '',
  Maximum_Capacity: 0,
  Activity_Hours: 3,
  Deadline: '',
};

export default function ActivityHeadActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  React.useEffect(() => { document.title = 'ระบบลงทะเบียน – จัดการกิจกรรม'; }, []);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<CreateActivityForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear() + 543);
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
  const [registrantsActivity, setRegistrantsActivity] = useState<Activity | null>(null);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendActivity, setExtendActivity] = useState<Activity | null>(null);
  const [extendTime, setExtendTime] = useState('');
  const [extendReason, setExtendReason] = useState('');

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

  const loadActivityTypes = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_BASE}/activities/types`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActivityTypes(data.data);
      }
    } catch (error) {
      console.error('Error loading activity types:', error);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    loadActivityTypes();
  }, [loadActivities, loadActivityTypes]);

  // Get unique years from activities
  const availableYears = Array.from(new Set(activities.map(a => a.Academic_Year))).sort((a, b) => b - a);
  if (availableYears.length > 0 && !availableYears.includes(yearFilter)) {
    // include current filter year
  }

  // View registrants
  const handleViewRegistrants = async (activity: Activity) => {
    setRegistrantsActivity(activity);
    setShowRegistrantsModal(true);
    setLoadingRegistrants(true);
    try {
      const res = await activitiesAPI.getRegistrations(activity.Activity_ID);
      if (res.success && res.data) {
        setRegistrants(res.data);
      }
    } catch { setRegistrants([]); }
    finally { setLoadingRegistrants(false); }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      !searchTerm ||
      activity.Activity_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.Activity_Details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.Activity_Location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || activity.Activity_Status === statusFilter;

    const matchesYear = activity.Academic_Year === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  // Stats
  const stats = {
    total: activities.length,
    approved: activities.filter((a) => a.Activity_Status === 'approved').length,
    pending: activities.filter((a) => a.Activity_Status === 'pending').length,
    rejected: activities.filter((a) => a.Activity_Status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) + ' น.' : '-';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">อนุมัติแล้ว</span>;
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">รออนุมัติ</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">ไม่อนุมัติ</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  // Open create modal
  const handleCreate = () => {
    setEditingActivity(null);
    setFormData(emptyForm);
    setFormErrors([]);
    setShowFormModal(true);
  };

  // Open edit modal
  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      Activity_Name: activity.Activity_Name,
      Activity_Details: activity.Activity_Details || '',
      Academic_Year: activity.Academic_Year,
      Activity_Type_ID: activity.Activity_Type_ID || '',
      Activity_Date: activity.Activity_Date ? activity.Activity_Date.substring(0, 10) : '',
      Activity_Time: activity.Activity_Time ? activity.Activity_Time.substring(0, 5) : '',
      Activity_Location: activity.Activity_Location || '',
      Maximum_Capacity: activity.Maximum_Capacity,
      Activity_Hours: activity.Activity_Hours || 3,
      Deadline: activity.Deadline ? activity.Deadline.substring(0, 16) : '',
    });
    setFormErrors([]);
    setShowFormModal(true);
  };

  // Open delete modal
  const handleDeleteClick = (activity: Activity) => {
    setDeletingActivity(activity);
    setShowDeleteModal(true);
  };

  // Validate form
  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.Activity_Name.trim()) errors.push('กรุณากรอกชื่อกิจกรรม');
    if (!formData.Activity_Date) errors.push('กรุณาเลือกวันที่จัดกิจกรรม');
    if (!formData.Activity_Time) errors.push('กรุณาเลือกเวลาจัดกิจกรรม');
    if (!formData.Activity_Location.trim()) errors.push('กรุณากรอกสถานที่จัดกิจกรรม');
    if (!formData.Maximum_Capacity || formData.Maximum_Capacity <= 0) errors.push('กรุณากรอกจำนวนผู้เข้าร่วมสูงสุด');
    if (!formData.Deadline) errors.push('กรุณาเลือกวันและเวลาปิดรับสมัคร');

    if (formData.Deadline && formData.Activity_Date) {
      const deadlineDate = new Date(formData.Deadline).toISOString().substring(0, 10);
      if (deadlineDate > formData.Activity_Date) {
        errors.push('วันปิดรับสมัครต้องไม่เกินวันจัดกิจกรรม');
      }
    }
    return errors;
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors([]);

      if (editingActivity) {
        await activitiesAPI.update(editingActivity.Activity_ID, formData);
        setMessage({ type: 'success', text: 'แก้ไขกิจกรรมเรียบร้อยแล้ว' });
      } else {
        await activitiesAPI.create(formData);
        setMessage({ type: 'success', text: 'เพิ่มกิจกรรมสำเร็จ' });
      }
      setShowAlertModal(true);
      setShowFormModal(false);
      loadActivities();
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล']);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingActivity) return;
    try {
      setDeleting(true);
      await activitiesAPI.delete(deletingActivity.Activity_ID);
      setMessage({ type: 'success', text: 'ลบกิจกรรมเรียบร้อยแล้ว' });
      setShowAlertModal(true);
      setShowDeleteModal(false);
      loadActivities();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'ไม่สามารถลบกิจกรรมได้' });
      setShowAlertModal(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Maximum_Capacity' || name === 'Academic_Year' || name === 'Activity_Hours' ? Number(value) : value,
    }));
  };

  // Auto-set deadline when event_date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, Activity_Date: value };
      if (value && !prev.Deadline) {
        const eventDate = new Date(value);
        eventDate.setDate(eventDate.getDate() - 1);
        eventDate.setHours(23, 59);
        updated.Deadline = eventDate.toISOString().slice(0, 16);
      }
      return updated;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">จัดการกิจกรรม</h1>
            <p className="text-sm md:text-base text-gray-600">สร้าง แก้ไข และจัดการกิจกรรมทั้งหมด</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-[#28A745] hover:bg-[#218838] text-white font-medium py-2 px-6 rounded-lg transition-colors text-center whitespace-nowrap"
          >
            + เพิ่มกิจกรรมใหม่
          </button>
        </div>

        {/* Alert Modal */}
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          type={message?.type || 'error'}
          message={message?.text || ''}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">กิจกรรมทั้งหมด</p>
            <p className="text-2xl font-bold text-[#2B4C8C]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">อนุมัติแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">รออนุมัติ</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">ไม่อนุมัติ</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหากิจกรรม</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อกิจกรรม..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ปีการศึกษา</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
              >
                {(availableYears.length > 0 ? availableYears : [new Date().getFullYear() + 543]).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="all">ทั้งหมด</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รออนุมัติ</option>
                <option value="rejected">ไม่อนุมัติ</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setYearFilter(new Date().getFullYear() + 543); }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-gray-600">ไม่พบกิจกรรมที่ค้นหา</p>
          </div>
        ) : (
          /* Activities Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อกิจกรรม</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่จัด</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลงทะเบียน</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ที่นั่ง</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActivities.map((activity) => {
                    const remaining = activity.Maximum_Capacity - (activity.Current_Registrations || 0);
                    const remainingColor = remaining > 20 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600';
                    return (
                      <tr key={activity.Activity_ID} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{activity.Activity_Name}</div>
                          <div className="text-xs text-gray-500">{activity.Activity_Type_Name || 'ทั่วไป'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(activity.Activity_Date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatTime(activity.Activity_Time)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-[150px] truncate">
                          {activity.Activity_Location}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                          <span className="font-semibold text-[#2B4C8C]">{activity.Current_Registrations || 0}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                          <span className={`font-semibold ${remainingColor}`}>{remaining}</span>
                          <span className="text-gray-400"> / {activity.Maximum_Capacity}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(activity.Activity_Status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            <button
                              onClick={() => handleViewRegistrants(activity)}
                              className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              ดูรายชื่อ
                            </button>
                            {activity.Activity_Status === 'approved' ? (
                              <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" title="ไม่สามารถแก้ไขกิจกรรมที่อนุมัติแล้วได้">
                                แก้ไข
                              </span>
                            ) : (
                              <button
                                onClick={() => handleEdit(activity)}
                                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                แก้ไข
                              </button>
                            )}
                            {activity.Activity_Status === 'approved' ? (
                              <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" title="ไม่สามารถลบกิจกรรมที่อนุมัติแล้วได้">
                                ลบ
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteClick(activity)}
                                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                ลบ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                พบกิจกรรมทั้งหมด {filteredActivities.length} รายการ
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ===== Create/Edit Activity Modal ===== */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editingActivity ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
              </h3>

              {/* Form Errors */}
              {formErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {formErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อกิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Activity_Name"
                    value={formData.Activity_Name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดกิจกรรม</label>
                  <textarea
                    name="Activity_Details"
                    value={formData.Activity_Details}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่จัดกิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="Activity_Date"
                      value={formData.Activity_Date}
                      onChange={handleDateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เวลา <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="Activity_Time"
                      value={formData.Activity_Time}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานที่จัดกิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Activity_Location"
                    value={formData.Activity_Location}
                    onChange={handleFormChange}
                    placeholder="เช่น ห้องประชุมใหญ่ อาคาร 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Capacity & Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนผู้เข้าร่วมสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="Maximum_Capacity"
                      value={formData.Maximum_Capacity || ''}
                      onChange={handleFormChange}
                      min={editingActivity ? (editingActivity.Current_Registrations || 1) : 1}
                      placeholder="เช่น 100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                      required
                    />
                    {editingActivity && (
                      <p className="mt-1 text-xs text-gray-500">
                        ผู้ลงทะเบียนปัจจุบัน: {editingActivity.Current_Registrations || 0} คน
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชั่วโมงกิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="Activity_Hours"
                      value={formData.Activity_Hours || ''}
                      onChange={handleFormChange}
                      min={1}
                      max={24}
                      placeholder="เช่น 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">จำนวนชั่วโมงที่ได้รับเมื่อเข้าร่วม</p>
                  </div>
                </div>

                {/* Time Management */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันและเวลาปิดรับสมัคร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="Deadline"
                      value={formData.Deadline}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เวลาสิ้นสุดการลงทะเบียน (สแกน)
                    </label>
                    <input
                      type="time"
                      name="Registration_End_Time"
                      value={formData.Registration_End_Time || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">หมดเวลาสแกนเข้าร่วม เช่น 10:00</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เวลาสิ้นสุดกิจกรรม
                    </label>
                    <input
                      type="time"
                      name="Activity_End_Time"
                      value={formData.Activity_End_Time || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">เวลาจบกิจกรรม เช่น 16:00</p>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                    <input
                      type="number"
                      name="Academic_Year"
                      value={formData.Academic_Year}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทกิจกรรม</label>
                    {activityTypes.length > 0 ? (
                      <div className="space-y-2 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {activityTypes.map((type) => (
                          <label key={type.Activity_Type_ID} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="radio"
                              name="Activity_Type_ID"
                              value={type.Activity_Type_ID}
                              checked={formData.Activity_Type_ID === type.Activity_Type_ID}
                              onChange={handleFormChange}
                              className="w-4 h-4 text-[#2B4C8C] focus:ring-[#2B4C8C]"
                            />
                            <span className="text-sm text-gray-700">{type.Activity_Type_Name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="Activity_Type_ID"
                        value={formData.Activity_Type_ID}
                        onChange={handleFormChange}
                        placeholder="รหัสประเภทกิจกรรม"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                      />
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>หมายเหตุ:</strong>{' '}
                    {editingActivity
                      ? 'การเปลี่ยนแปลงข้อมูลอาจส่งผลต่อผู้ที่ลงทะเบียนไว้แล้ว กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก'
                      : 'กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก หลังจากสร้างกิจกรรมแล้ว จะต้องรอคณบดีอนุมัติก่อนนักศึกษาจะลงทะเบียนได้'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'กำลังบันทึก...' : editingActivity ? 'บันทึกการแก้ไข' : 'บันทึกกิจกรรม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    disabled={submitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== Registrants Modal ===== */}
      {showRegistrantsModal && registrantsActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">รายชื่อผู้ลงทะเบียน</h3>
                <button onClick={() => setShowRegistrantsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">กิจกรรม: <strong>{registrantsActivity.Activity_Name}</strong></p>
              {loadingRegistrants ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
                  <p className="mt-2 text-gray-500">กำลังโหลด...</p>
                </div>
              ) : registrants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ยังไม่มีผู้ลงทะเบียน</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">รหัสนักศึกษา</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ชื่อ-นามสกุล</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">สถานะเข้าร่วม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {registrants.map((s: any, i: number) => (
                        <tr key={s.Student_ID} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{i + 1}</td>
                          <td className="px-3 py-2 text-gray-800">{s.Student_ID}</td>
                          <td className="px-3 py-2 text-gray-800">{s.Student_Name || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            {s.Has_CheckedIn ? (
                              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">เช็คอินแล้ว</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">ยังไม่เช็คอิน</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-sm text-gray-500">รวม {registrants.length} คน | เช็คอินแล้ว {registrants.filter((s: any) => s.Has_CheckedIn).length} คน</p>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setExtendActivity(registrantsActivity);
                    setExtendTime('');
                    setExtendReason('');
                    setShowExtendModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  ขยายเวลาสิ้นสุดการลงทะเบียน
                </button>
                <button onClick={() => setShowRegistrantsModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Extend Deadline Modal ===== */}
      {showExtendModal && extendActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ขยายเวลาสิ้นสุดการลงทะเบียน</h3>
              <p className="text-sm text-gray-600 mb-4">กิจกรรม: <strong>{extendActivity.Activity_Name}</strong></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุดใหม่ <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={extendTime}
                    onChange={(e) => setExtendTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผลในการขยายเวลา <span className="text-red-500">*</span></label>
                  <textarea
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    rows={3}
                    placeholder="เช่น มีนักศึกษามาสายจำนวนมาก"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (!extendTime || !extendReason.trim()) {
                      setMessage({ type: 'error', text: 'กรุณากรอกเวลาและเหตุผล' });
                      setShowAlertModal(true);
                      return;
                    }
                    setMessage({ type: 'success', text: `ขยายเวลาสิ้นสุดการลงทะเบียนเป็น ${extendTime} น. เรียบร้อยแล้ว\nเหตุผล: ${extendReason}` });
                    setShowAlertModal(true);
                    setShowExtendModal(false);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ยืนยันขยายเวลา
                </button>
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {showDeleteModal && deletingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-4xl text-red-500 mb-2">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800">ยืนยันการลบ</h3>
              </div>

              <p className="text-gray-600 text-center mb-2">
                คุณต้องการลบกิจกรรม
              </p>
              <p className="text-center font-semibold text-gray-800 mb-4">
                &quot;{deletingActivity.Activity_Name}&quot;
              </p>
              <p className="text-center text-sm text-red-600 mb-6">
                ⚠️ การลบจะรวมถึงข้อมูลการลงทะเบียนทั้งหมด
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
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
