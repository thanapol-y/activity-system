'use client';

import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export default function AlertModal({ isOpen, onClose, type, title, message }: AlertModalProps) {
  if (!isOpen) return null;

  const config = {
    success: {
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      defaultTitle: 'สำเร็จ',
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      buttonColor: 'bg-red-500 hover:bg-red-600',
      defaultTitle: 'เกิดข้อผิดพลาด',
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    warning: {
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
      defaultTitle: 'คำเตือน',
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    info: {
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      defaultTitle: 'แจ้งเตือน',
      icon: (
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const { bgColor, iconColor, buttonColor, defaultTitle, icon } = config[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 text-center animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        </div>
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title || defaultTitle}</h3>
        {/* Message */}
        <p className="text-gray-600 text-sm mb-6 whitespace-pre-line">{message}</p>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full ${buttonColor} text-white font-semibold py-3 rounded-xl transition-colors text-base`}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
