import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

/**
 * Create a problem report (Club submits)
 */
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
      return;
    }

    const { Activity_ID, Report_Text } = req.body;
    const Club_ID = req.user.userId;

    if (!Activity_ID || !Report_Text?.trim()) {
      res.status(400).json({
        success: false,
        message: 'กรุณาระบุรหัสกิจกรรมและรายละเอียดการรายงาน',
      });
      return;
    }

    await pool.query(
      `INSERT INTO problem_report (Activity_ID, Club_ID, Report_Text) VALUES (?, ?, ?)`,
      [Activity_ID, Club_ID, Report_Text.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'ส่งรายงานสำเร็จ',
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get reports for activity head (reports for their activities)
 */
export const getReportsForActivityHead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
      return;
    }

    const activityHeadId = req.user.userId;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pr.Report_ID, pr.Activity_ID, pr.Club_ID, pr.Report_Text, pr.Report_Status, pr.Created_At, pr.Updated_At,
              a.Activity_Name, c.Club_Name
       FROM problem_report pr
       JOIN activity a ON pr.Activity_ID = a.Activity_ID
       JOIN club c ON pr.Club_ID = c.Club_ID
       WHERE a.Activity_Head_ID = ?
       ORDER BY pr.Created_At DESC`,
      [activityHeadId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update report status (activity head acknowledges/resolves)
 */
export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'acknowledged', 'resolved'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง',
      });
      return;
    }

    await pool.query(
      `UPDATE problem_report SET Report_Status = ? WHERE Report_ID = ?`,
      [status, id]
    );

    res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะรายงานสำเร็จ',
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get reports submitted by a club
 */
export const getMyReports = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
      return;
    }

    const clubId = req.user.userId;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pr.Report_ID, pr.Activity_ID, pr.Report_Text, pr.Report_Status, pr.Created_At,
              a.Activity_Name
       FROM problem_report pr
       JOIN activity a ON pr.Activity_ID = a.Activity_ID
       WHERE pr.Club_ID = ?
       ORDER BY pr.Created_At DESC`,
      [clubId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get gender options
 */
export const getGenders = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM gender');
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Get genders error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
