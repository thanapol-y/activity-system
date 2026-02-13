'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Student_ID: '',
    Student_Name: '',
    Student_Password: '',
    confirmPassword: '',
    Student_Email: '',
    Student_Phone: '',
    Faculty_ID: '',
    Branch_ID: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (!formData.Student_ID.trim()) errs.push('กรุณากรอกรหัสนักศึกษา');
    if (!formData.Student_Name.trim()) errs.push('กรุณากรอกชื่อ-นามสกุล');
    if (!formData.Student_Password) errs.push('กรุณากรอกรหัสผ่าน');
    if (formData.Student_Password.length < 6) errs.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (formData.Student_Password !== formData.confirmPassword) errs.push('รหัสผ่านไม่ตรงกัน');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSubmitting(true);
      const { confirmPassword, ...data } = formData;
      const response = await authAPI.registerStudent(data);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'สมัครสมาชิกไม่สำเร็จ']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">สมัครสมาชิก</h1>
            <p className="text-sm text-gray-600">สำหรับนักศึกษาใหม่</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">สมัครสมาชิกสำเร็จ!</h3>
              <p className="text-sm text-gray-600">กำลังนำคุณไปหน้าเข้าสู่ระบบ...</p>
            </div>
          ) : (
            <>
              {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสนักศึกษา <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Student_ID"
                    value={formData.Student_ID}
                    onChange={handleChange}
                    placeholder="เช่น 076760305034-9"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Student_Name"
                    value={formData.Student_Name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อ-นามสกุล"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    name="Student_Email"
                    value={formData.Student_Email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                  <input
                    type="text"
                    name="Student_Phone"
                    value={formData.Student_Phone}
                    onChange={handleChange}
                    placeholder="0812345678"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="Student_Password"
                    value={formData.Student_Password}
                    onChange={handleChange}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  มีบัญชีอยู่แล้ว?{' '}
                  <Link href="/login" className="text-[#2B4C8C] font-medium hover:underline">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-white/80">
          © {new Date().getFullYear()} ระบบลงทะเบียนเข้าร่วมกิจกรรม
        </p>
      </div>
    </div>
  );
}
