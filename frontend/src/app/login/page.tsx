"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

const quickAccounts = [
  { role: UserRole.STUDENT, userId: '076760305034-9', password: 'password', label: 'นักศึกษา - นายธนาพล อยู่ยืน' },
  { role: UserRole.STUDENT, userId: '076760305001-8', password: 'password', label: 'นักศึกษา - นายสุขุม พวงแสงเพ็ญ' },
  { role: UserRole.STUDENT, userId: '076760305040-6', password: 'password', label: 'นักศึกษา - นายธีรชาติ คุณละ' },
  { role: UserRole.STUDENT, userId: '076760305012-5', password: 'password', label: 'นักศึกษา - นายธนวุฒิ แก้วช่วย' },
  { role: UserRole.STUDENT, userId: '076760305011-7', password: 'password', label: 'นักศึกษา - นายธนวัฒน์ อิ่มเพชร' },
  { role: UserRole.STUDENT, userId: '076760305018-2', password: 'password', label: 'นักศึกษา - นายกรวิชญ์ ยันตรีสิงห์' },
  { role: UserRole.CLUB, userId: 'club001', password: 'password', label: 'สโมสร - นายสมพงษ์ ขยัน' },
  { role: UserRole.CLUB, userId: 'club002', password: 'password', label: 'สโมสร - นายธนพล ดีมาก' },
  { role: UserRole.CLUB, userId: 'club003', password: 'password', label: 'สโมสร - นางสาวชุติมา สวยงาม' },
  { role: UserRole.CLUB, userId: 'club004', password: 'password', label: 'สโมสร - นางสาวสมศรี มานะ' },
  { role: UserRole.ACTIVITY_HEAD, userId: 'head001', password: 'password', label: 'หัวหน้ากิจกรรม - นางลาวัลย์ สายสุวรรณ' },
  { role: UserRole.ACTIVITY_HEAD, userId: 'head002', password: 'password', label: 'หัวหน้ากิจกรรม - อาจารย์คัมภีร์ เนตรอัมพร' },
  { role: UserRole.ACTIVITY_HEAD, userId: 'head003', password: 'password', label: 'หัวหน้ากิจกรรม - อาจารย์ศราวุธ แดงมาก' },
  { role: UserRole.DEAN, userId: 'dean001', password: 'password', label: 'รองคณบดี - ดร.ศรีสุดา อินทมาศ' },
  { role: UserRole.ADMIN, userId: 'admin001', password: 'password', label: 'ผู้ดูแลระบบ' },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    role: UserRole.STUDENT,
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  const roleOptions = [
    { value: UserRole.STUDENT, label: "นักศึกษา" },
    { value: UserRole.CLUB, label: "สโมสรนักศึกษา" },
    { value: UserRole.ACTIVITY_HEAD, label: "หัวหน้ากิจกรรม" },
    { value: UserRole.DEAN, label: "รองคณบดีฝ่ายกิจการนักศึกษา" },
    { value: UserRole.ADMIN, label: "ผู้ดูแลระบบ (Admin)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.userId || !formData.password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      await login(formData.userId, formData.password, formData.role);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const getUserIdPlaceholder = () => {
    switch (formData.role) {
      case UserRole.STUDENT:
        return "กรอกรหัสนักศึกษา 13 หลัก";
      case UserRole.CLUB:
        return "กรอกรหัสสโมสรนักศึกษา";
      case UserRole.ACTIVITY_HEAD:
        return "กรอกรหัสหัวหน้ากิจกรรม";
      case UserRole.DEAN:
        return "กรอกรหัสรองคณบดี";
      case UserRole.ADMIN:
        return "กรอกรหัสผู้ดูแลระบบ";
      default:
        return "กรอกรหัสผู้ใช้";
    }
  };

  const handleQuickLogin = async (account: typeof quickAccounts[0]) => {
    setError('');
    setShowQuickLogin(false);
    try {
      await login(account.userId, account.password, account.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT: return 'bg-blue-100 text-blue-800';
      case UserRole.CLUB: return 'bg-green-100 text-green-800';
      case UserRole.ACTIVITY_HEAD: return 'bg-purple-100 text-purple-800';
      case UserRole.DEAN: return 'bg-yellow-100 text-yellow-800';
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] flex items-center justify-center p-4">
      {/* Quick Login Button (hamburger) */}
      <button
        onClick={() => setShowQuickLogin(!showQuickLogin)}
        className="fixed top-4 right-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-lg transition-colors shadow-lg"
        title="เข้าสู่ระบบด่วน (บัญชีทดสอบ)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Quick Login Panel */}
      {showQuickLogin && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowQuickLogin(false)}>
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-2xl overflow-y-auto z-50 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-[#2B4C8C] to-[#3B5998] text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">เข้าสู่ระบบด่วน</h2>
                <button onClick={() => setShowQuickLogin(false)} className="p-1 hover:bg-white/20 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-white/80 mt-1">กดเลือกบัญชีเพื่อเข้าสู่ระบบทันที</p>
            </div>
            <div className="p-2 space-y-1">
              {quickAccounts.map((account, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickLogin(account)}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-3"
                >
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getRoleBadgeColor(account.role)}`}>
                    {account.role === UserRole.STUDENT ? 'นศ.' : account.role === UserRole.CLUB ? 'สโมสร' : account.role === UserRole.ACTIVITY_HEAD ? 'หน.กิจ' : account.role === UserRole.DEAN ? 'รองคณบดี' : 'Admin'}
                  </span>
                  <span className="text-sm text-gray-800 truncate">{account.label.split(' - ')[1] || account.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md lg:max-w-lg">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo2.png"
                alt="คณะบริหารธุรกิจ มทร.พระนคร"
                width={160}
                height={160}
                className="object-contain drop-shadow-md w-28 h-28 sm:w-40 sm:h-40"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              ระบบกิจกรรมนักศึกษา มทร.พระนคร
            </h3>
            <p className="text-sm text-gray-500">กรุณาเลือกประเภทผู้ใช้งาน กรอกรหัสผู้ใช้ และรหัสผ่าน</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ประเภทผู้ใช้งาน
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                disabled={isLoading}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User ID Field */}
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {formData.role === UserRole.STUDENT
                  ? "รหัสนักศึกษา"
                  : formData.role === UserRole.ADMIN
                    ? "รหัสผู้ดูแลระบบ"
                    : "รหัสผู้ใช้"}
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder={getUserIdPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder:text-gray-400"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                รหัสผ่าน
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่าน"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder:text-gray-400"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <div className="mt-6 text-center text-sm text-white/80 space-y-3">
          <p className="font-medium text-white/90">พบปัญหาการใช้งาน? ติดต่อเจ้าหน้าที่กิจกรรมนักศึกษาได้ในวันและเวลาราชการ</p>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>02-665-3777 ต่อ 6636</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>fb.com/OREGRMUTP</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>atichat.k@rmutp.ac.th</span>
            </div>
          </div>
          <p className="text-xs text-white/50 pt-2">คณะบริหารธุรกิจ มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร</p>
        </div>
      </div>
    </div>
  );
}
