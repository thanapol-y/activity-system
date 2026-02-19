'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { adminAPI } from '@/lib/api';

interface UserRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  faculty?: string;
  branch?: string;
  department?: string;
  [key: string]: any;
}

// Field definitions per role
const roleFields: Record<string, { key: string; label: string; required?: boolean; type?: string }[]> = {
  student: [
    { key: 'Student_ID', label: 'รหัสนักศึกษา', required: true },
    { key: 'Student_Name', label: 'ชื่อ-นามสกุล', required: true },
    { key: 'Student_Email', label: 'อีเมล' },
    { key: 'Student_Phone', label: 'เบอร์โทร' },
    { key: 'Gender_ID', label: 'เพศ' },
    { key: 'Faculty_ID', label: 'รหัสคณะ' },
    { key: 'Branch_ID', label: 'รหัสสาขา' },
  ],
  club: [
    { key: 'Club_ID', label: 'รหัสสโมสร', required: true },
    { key: 'Club_Name', label: 'ชื่อสโมสร', required: true },
    { key: 'Club_Email', label: 'อีเมล' },
    { key: 'Faculty_ID', label: 'รหัสคณะ' },
    { key: 'Branch_ID', label: 'รหัสสาขา' },
  ],
  activity_head: [
    { key: 'Activity_Head_ID', label: 'รหัสหัวหน้ากิจกรรม', required: true },
    { key: 'Activity_Head_Name', label: 'ชื่อ-นามสกุล', required: true },
    { key: 'Activity_Head_Email', label: 'อีเมล' },
    { key: 'Activity_Head_Phone', label: 'เบอร์โทร' },
    { key: 'Department_ID', label: 'รหัสแผนก' },
  ],
  dean: [
    { key: 'Dean_ID', label: 'รหัสรองคณบดี', required: true },
    { key: 'Dean_Name', label: 'ชื่อ-นามสกุล', required: true },
    { key: 'Dean_Email', label: 'อีเมล' },
    { key: 'Department_ID', label: 'รหัสแผนก' },
  ],
};

const roleLabels: Record<string, string> = {
  student: 'นักศึกษา',
  club: 'สโมสรนักศึกษา',
  activity_head: 'หัวหน้ากิจกรรม',
  dean: 'รองคณบดี',
};

const getIdField = (role: string): string => {
  switch (role) {
    case 'student': return 'Student_ID';
    case 'club': return 'Club_ID';
    case 'activity_head': return 'Activity_Head_ID';
    case 'dean': return 'Dean_ID';
    default: return 'id';
  }
};

const getNameField = (role: string): string => {
  switch (role) {
    case 'student': return 'Student_Name';
    case 'club': return 'Club_Name';
    case 'activity_head': return 'Activity_Head_Name';
    case 'dean': return 'Dean_Name';
    default: return 'name';
  }
};

const getEmailField = (role: string): string => {
  switch (role) {
    case 'student': return 'Student_Email';
    case 'club': return 'Club_Email';
    case 'activity_head': return 'Activity_Head_Email';
    case 'dean': return 'Dean_Email';
    default: return 'email';
  }
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(selectedRole, search || undefined, currentPage, 15);
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, search, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setCurrentPage(1);
    setSearch('');
  }, [selectedRole]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Create ---
  const handleOpenCreate = () => {
    const fields = roleFields[selectedRole] || [];
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.key] = ''));
    initial['password'] = '';
    setFormData(initial);
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    const fields = roleFields[selectedRole] || [];
    const errors: string[] = [];
    fields.forEach((f) => {
      if (f.required && !formData[f.key]?.trim()) {
        errors.push(`กรุณากรอก${f.label}`);
      }
    });
    if (!formData['password']?.trim()) errors.push('กรุณากรอกรหัสผ่าน');
    if (formData['password'] && formData['password'].length < 4) errors.push('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.createUser(selectedRole, formData);
      showMsg('success', `เพิ่ม${roleLabels[selectedRole]}สำเร็จ`);
      setShowCreateModal(false);
      loadUsers();
    } catch (error) {
      showMsg('error', error instanceof Error ? error.message : 'เพิ่มผู้ใช้ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Edit ---
  const handleOpenEdit = (record: any) => {
    setSelectedUser(record);
    const fields = roleFields[selectedRole] || [];
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.key] = record[f.key] || ''));
    setFormData(initial);
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    const fields = roleFields[selectedRole] || [];
    const errors: string[] = [];
    fields.forEach((f) => {
      if (f.required && !formData[f.key]?.trim()) {
        errors.push(`กรุณากรอก${f.label}`);
      }
    });
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const idField = getIdField(selectedRole);
    try {
      setSubmitting(true);
      await adminAPI.updateUser(selectedRole, selectedUser[idField], formData);
      showMsg('success', `แก้ไขข้อมูลสำเร็จ`);
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      showMsg('error', error instanceof Error ? error.message : 'แก้ไขข้อมูลไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleOpenDelete = (record: any) => {
    setSelectedUser(record);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    const idField = getIdField(selectedRole);
    try {
      setSubmitting(true);
      await adminAPI.deleteUser(selectedRole, selectedUser[idField]);
      showMsg('success', `ลบผู้ใช้สำเร็จ`);
      setShowDeleteModal(false);
      loadUsers();
    } catch (error) {
      showMsg('error', error instanceof Error ? error.message : 'ลบผู้ใช้ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Reset Password ---
  const handleOpenResetPassword = (record: any) => {
    setSelectedUser(record);
    setNewPassword('');
    setFormErrors([]);
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!newPassword.trim()) {
      setFormErrors(['กรุณากรอกรหัสผ่านใหม่']);
      return;
    }
    if (newPassword.length < 4) {
      setFormErrors(['รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร']);
      return;
    }

    const idField = getIdField(selectedRole);
    try {
      setSubmitting(true);
      await adminAPI.resetPassword(selectedRole, selectedUser[idField], newPassword);
      showMsg('success', `รีเซ็ตรหัสผ่านสำเร็จ`);
      setShowResetPasswordModal(false);
    } catch (error) {
      showMsg('error', error instanceof Error ? error.message : 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!user) return null;

  const idField = getIdField(selectedRole);
  const nameField = getNameField(selectedRole);
  const emailField = getEmailField(selectedRole);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">จัดการผู้ใช้</h1>
          <p className="text-sm md:text-base text-gray-600">เพิ่ม แก้ไข ลบ และรีเซ็ตรหัสผ่านผู้ใช้ทุกประเภท</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Role Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {Object.entries(roleLabels).map(([role, label]) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  selectedRole === role
                    ? 'text-[#2B4C8C] bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
                {selectedRole === role && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2B4C8C]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Add */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={`ค้นหา${roleLabels[selectedRole]}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleOpenCreate}
              className="bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-6 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่ม{roleLabels[selectedRole]}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">ไม่พบข้อมูล{roleLabels[selectedRole]}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((record) => (
                    <tr key={record[idField]} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record[idField]}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                        {record[nameField]}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record[emailField] || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="แก้ไข"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleOpenResetPassword(record)}
                            className="px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                            title="รีเซ็ตรหัสผ่าน"
                          >
                            รีเซ็ต
                          </button>
                          <button
                            onClick={() => handleOpenDelete(record)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="ลบ"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === currentPage
                            ? 'text-white bg-[#2B4C8C]'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                เพิ่ม{roleLabels[selectedRole]}
              </h3>

              {formErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {(roleFields[selectedRole] || []).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFormChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData['password'] || ''}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="flex-1 bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                แก้ไข{roleLabels[selectedRole]}
              </h3>

              {formErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {(roleFields[selectedRole] || []).map((field) => {
                  const isIdField = field.key === getIdField(selectedRole);
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        disabled={isIdField}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white ${isIdField ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEdit}
                  disabled={submitting}
                  className="flex-1 bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบ</h3>
                <p className="text-sm text-gray-600 mt-2">
                  คุณต้องการลบ <strong>{selectedUser[getNameField(selectedRole)]}</strong> ({selectedUser[getIdField(selectedRole)]}) ใช่หรือไม่?
                </p>
                <p className="text-xs text-red-500 mt-1">การกระทำนี้ไม่สามารถยกเลิกได้</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'กำลังลบ...' : 'ลบ'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">รีเซ็ตรหัสผ่าน</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedUser[getNameField(selectedRole)]} ({selectedUser[getIdField(selectedRole)]})
              </p>

              {formErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFormErrors([]); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  disabled={submitting}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
                </button>
                <button
                  onClick={() => setShowResetPasswordModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
