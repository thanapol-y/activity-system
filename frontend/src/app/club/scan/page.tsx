'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { registrationAPI } from '@/lib/api';

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  studentId?: string;
  activityTitle?: string;
  alreadyChecked?: boolean;
}

export default function ClubScanPage() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualQR, setManualQR] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<ScanResult[]>([]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    scanningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        scanningRef.current = true;
        scanQRCode();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์');
    }
  };

  const scanQRCode = useCallback(() => {
    if (!scanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR if available (loaded via CDN)
      if (typeof window !== 'undefined' && (window as any).jsQR) {
        const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          scanningRef.current = false;
          processQRCode(code.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanQRCode);
  }, []);

  const processQRCode = async (qrData: string) => {
    try {
      setProcessing(true);
      await doCheckIn(qrData);
    } catch {
      showResult({ success: false, message: 'QR Code ไม่ถูกต้อง' });
    } finally {
      setProcessing(false);
      // Resume scanning after 3 seconds
      setTimeout(() => {
        setResult(null);
        scanningRef.current = true;
        scanQRCode();
      }, 3000);
    }
  };

  const doCheckIn = async (qrData: string) => {
    try {
      setProcessing(true);
      const response = await registrationAPI.checkIn(qrData);

      if (response.success) {
        const res: ScanResult = {
          success: true,
          message: 'เช็คอินสำเร็จ',
          studentName: (response.data as any)?.studentName,
          studentId: (response.data as any)?.studentId,
          activityTitle: (response.data as any)?.activityTitle,
        };
        showResult(res);
        setRecentCheckins((prev) => [res, ...prev].slice(0, 10));
      } else {
        showResult({
          success: false,
          message: response.message || 'เช็คอินไม่สำเร็จ',
        });
      }
    } catch (error) {
      showResult({
        success: false,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      });
    } finally {
      setProcessing(false);
    }
  };

  const showResult = (res: ScanResult) => {
    setResult(res);
  };

  const handleManualCheckIn = async () => {
    const qrCode = manualQR.trim();
    if (!qrCode) {
      showResult({ success: false, message: 'กรุณากรอกรหัส QR Code' });
      return;
    }
    await doCheckIn(qrCode);
    setManualQR('');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Load jsQR library */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js" async />

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">สแกน QR Code เช็คอิน</h1>
          <p className="text-sm md:text-base text-gray-600">สแกน QR Code ของนักศึกษาเพื่อยืนยันการเข้าร่วมกิจกรรม</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Scanner Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Camera Status */}
            {!cameraActive && (
              <div className="text-center py-8">
                <button
                  onClick={startCamera}
                  className="bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    เปิดกล้องเพื่อสแกน
                  </span>
                </button>

                {cameraError && (
                  <p className="mt-4 text-sm text-red-600">{cameraError}</p>
                )}
              </div>
            )}

            {/* Camera View */}
            <div className={`relative ${cameraActive ? 'block' : 'hidden'}`}>
              <div className="relative w-full max-w-[640px] mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto block"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[250px] h-[250px] border-[3px] border-white rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                </div>

                {/* Processing indicator */}
                {processing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  ปิดกล้อง
                </button>
              </div>
            </div>

            {/* Scan Result */}
            {result && (
              <div
                className={`mt-6 p-4 rounded-lg border-2 animate-[slideIn_0.3s_ease] ${
                  result.success
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{result.success ? '✓' : '✗'}</span>
                </div>
                <h3 className={`text-center text-lg font-semibold mb-3 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </h3>

                {result.success && (result.studentName || result.studentId) && (
                  <div className="bg-white p-4 rounded-lg">
                    {result.studentName && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>ชื่อ:</strong> {result.studentName}
                      </p>
                    )}
                    {result.studentId && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>รหัสนักศึกษา:</strong> {result.studentId}
                      </p>
                    )}
                    {result.activityTitle && (
                      <p className="text-sm text-gray-700">
                        <strong>กิจกรรม:</strong> {result.activityTitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manual Input */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">หรือกรอกรหัส QR Code ด้วยตนเอง</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={manualQR}
                  onChange={(e) => setManualQR(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()}
                  placeholder="กรอกรหัส QR Code..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
                  disabled={processing}
                />
                <button
                  onClick={handleManualCheckIn}
                  disabled={processing}
                  className="bg-[#2B4C8C] hover:bg-[#1e3563] text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'กำลังเช็คอิน...' : 'เช็คอิน'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          {recentCheckins.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                เช็คอินล่าสุด ({recentCheckins.length})
              </h3>
              <div className="space-y-3">
                {recentCheckins.map((checkin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {checkin.studentName || checkin.studentId || 'นักศึกษา'}
                      </p>
                      {checkin.studentId && (
                        <p className="text-xs text-gray-500">{checkin.studentId}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      ✓ เช็คอินแล้ว
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
