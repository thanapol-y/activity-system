'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-6"></div>
        <p className="text-white text-xl font-medium">กำลังโหลด...</p>
        <p className="text-white/70 text-sm mt-2">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}
