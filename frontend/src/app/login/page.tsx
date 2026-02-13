"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    role: UserRole.STUDENT,
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ระบบลงทะเบียนเข้าร่วมกิจกรรม
            </h1>
            <p className="text-sm text-gray-600">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
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

          {/* Additional Info */}
          {formData.role === UserRole.STUDENT && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                สำหรับนักศึกษา: กรุณาใช้รหัสนักศึกษา 13 หลัก
                <br />
                (ตัวอย่าง: 076760305034-9)
              </p>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-white/80">
          © {new Date().getFullYear()} ระบบลงทะเบียนเข้าร่วมกิจกรรม
        </p>
      </div>
    </div>
  );
}
