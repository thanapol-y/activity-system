import QRCode from 'qrcode';
import { QRCodeData } from '../types';

/**
 * Generate QR code data string
 */
export const generateQRCodeData = (studentId: string, activityId: string): string => {
  const qrData: QRCodeData = {
    studentId,
    activityId,
    timestamp: Date.now(),
  };

  return JSON.stringify(qrData);
};

/**
 * Parse QR code data string
 */
export const parseQRCodeData = (qrDataString: string): QRCodeData | null => {
  try {
    const data = JSON.parse(qrDataString) as QRCodeData;

    // Validate required fields
    if (!data.studentId || !data.activityId || !data.timestamp) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Generate QR code image as data URL
 */
export const generateQRCodeImage = async (
  studentId: string,
  activityId: string
): Promise<string> => {
  try {
    const qrData = generateQRCodeData(studentId, activityId);

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION as 'L' | 'M' | 'Q' | 'H' || 'M',
      width: parseInt(process.env.QR_CODE_SIZE || '300'),
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as buffer (for file download)
 */
export const generateQRCodeBuffer = async (
  studentId: string,
  activityId: string
): Promise<Buffer> => {
  try {
    const qrData = generateQRCodeData(studentId, activityId);

    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION as 'L' | 'M' | 'Q' | 'H' || 'M',
      width: parseInt(process.env.QR_CODE_SIZE || '300'),
      margin: 2,
    });

    return buffer;
  } catch (error) {
    throw new Error('Failed to generate QR code buffer');
  }
};

/**
 * Validate QR code data (check expiration, format, etc.)
 */
export const validateQRCodeData = (qrData: QRCodeData): { valid: boolean; message?: string } => {
  // Check if data is too old (e.g., 24 hours)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();

  if (now - qrData.timestamp > maxAge) {
    return {
      valid: false,
      message: 'QR code has expired',
    };
  }

  // Validate student ID format (13 digits with dash)
  const studentIdRegex = /^\d{12}-\d$/;
  if (!studentIdRegex.test(qrData.studentId)) {
    return {
      valid: false,
      message: 'Invalid student ID format',
    };
  }

  return {
    valid: true,
  };
};

/**
 * Generate QR code SVG string
 */
export const generateQRCodeSVG = async (
  studentId: string,
  activityId: string
): Promise<string> => {
  try {
    const qrData = generateQRCodeData(studentId, activityId);

    const svg = await QRCode.toString(qrData, {
      type: 'svg',
      errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION as 'L' | 'M' | 'Q' | 'H' || 'M',
      width: parseInt(process.env.QR_CODE_SIZE || '300'),
      margin: 2,
    });

    return svg;
  } catch (error) {
    throw new Error('Failed to generate QR code SVG');
  }
};
