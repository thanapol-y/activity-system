'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3A4A5C] text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full" />
              <h3 className="text-white font-semibold text-lg">ระบบลงทะเบียนเข้าร่วมกิจกรรม</h3>
            </div>
            <p className="text-sm leading-relaxed">
              ฝ่ายกิจการนักศึกษา คณะบริหารธุรกิจ
              มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร
              ระบบจัดการกิจกรรมและเช็คอินด้วย QR Code ออนไลน์
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">ลิงก์ที่เกี่ยวข้อง</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://bus.rmutp.ac.th" className="hover:text-white transition-colors" target="_blank">
                  คณะบริหารธุรกิจ มทร.พระนคร
                </Link>
              </li>
              <li>
                <Link href="https://bus.rmutp.ac.th/student-affairs-department/" className="hover:text-white transition-colors" target="_blank">
                  ฝ่ายกิจการนักศึกษา
                </Link>
              </li>
              <li>
                <Link href="https://www.facebook.com/OREGRMUTP" className="hover:text-white transition-colors" target="_blank">
                  Facebook: OREGRMUTP
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">ติดต่อเรา</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>02-665-3777 ต่อ 6636</span>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>atichat.k@rmutp.ac.th</span>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>86 ถ.พิษณุโลก แขวงสรรพศรี เขตพระนคร กรุงเทพฯ 10200</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-600">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-400">
            © {currentYear} ฝ่ายกิจการนักศึกษา คณะบริหารธุรกิจ มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร
          </p>
        </div>
      </div>
    </footer>
  );
}
