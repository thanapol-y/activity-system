import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { UserRole, LoginRequest, Student, Dean, ActivityHead, Club } from '../types';
import { RowDataPacket } from 'mysql2';

/**
 * Login handler for all user types
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password, role } = req.body as LoginRequest;

    // Validate input
    if (!userId || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผู้ใช้ รหัสผ่าน และประเภทผู้ใช้',
      });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        message: 'ประเภทผู้ใช้ไม่ถูกต้อง',
      });
      return;
    }

    let user: any = null;
    let tableName = '';
    let idColumn = '';
    let nameColumn = '';
    let passwordColumn = '';
    let emailColumn = '';

    // Determine table and columns based on role
    switch (role) {
      case UserRole.STUDENT:
        tableName = 'student';
        idColumn = 'Student_ID';
        nameColumn = 'Student_Name';
        passwordColumn = 'Student_Password';
        emailColumn = 'Student_Email';
        break;
      case UserRole.DEAN:
        tableName = 'dean';
        idColumn = 'Dean_ID';
        nameColumn = 'Dean_Name';
        passwordColumn = 'Dean_Password';
        emailColumn = 'Dean_Email';
        break;
      case UserRole.ACTIVITY_HEAD:
        tableName = 'activity_head';
        idColumn = 'Activity_Head_ID';
        nameColumn = 'Activity_Head_Name';
        passwordColumn = 'Activity_Head_Password';
        emailColumn = 'Activity_Head_Email';
        break;
      case UserRole.CLUB:
        tableName = 'club';
        idColumn = 'Club_ID';
        nameColumn = 'Club_Name';
        passwordColumn = 'Club_Password';
        emailColumn = 'Club_Email';
        break;
      case UserRole.ADMIN:
        tableName = 'admin';
        idColumn = 'Admin_ID';
        nameColumn = 'Admin_Name';
        passwordColumn = 'Admin_Password';
        emailColumn = 'Admin_Email';
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'ประเภทผู้ใช้ไม่ถูกต้อง',
        });
        return;
    }

    // Query user from database
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`,
      [userId]
    );

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    user = rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[passwordColumn]);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user[idColumn],
      role: role,
      name: user[nameColumn],
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user[idColumn],
        name: user[nameColumn],
        email: user[emailColumn],
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อน',
      });
      return;
    }

    const { userId, role } = req.user;

    let tableName = '';
    let idColumn = '';
    let selectColumns = '';

    // Determine table and columns based on role
    switch (role) {
      case UserRole.STUDENT:
        tableName = 'student';
        idColumn = 'Student_ID';
        selectColumns = 's.Student_ID, s.Student_Name, s.Faculty_ID, s.Branch_ID, s.Student_Email, s.Student_Phone, s.Gender_ID, g.Gender_Name, f.Faculty_Name, b.Branch_Name';
        break;
      case UserRole.DEAN:
        tableName = 'dean';
        idColumn = 'Dean_ID';
        selectColumns = 'Dean_ID, Dean_Name, Department_ID, Dean_Email';
        break;
      case UserRole.ACTIVITY_HEAD:
        tableName = 'activity_head';
        idColumn = 'Activity_Head_ID';
        selectColumns = 'Activity_Head_ID, Activity_Head_Name, Department_ID, Activity_Head_Email, Activity_Head_Phone';
        break;
      case UserRole.CLUB:
        tableName = 'club';
        idColumn = 'Club_ID';
        selectColumns = 'Club_ID, Club_Name, Faculty_ID, Branch_ID, Club_Email';
        break;
      case UserRole.ADMIN:
        tableName = 'admin';
        idColumn = 'Admin_ID';
        selectColumns = 'Admin_ID, Admin_Name, Admin_Email';
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'ประเภทผู้ใช้ไม่ถูกต้อง',
        });
        return;
    }

    // Query user from database
    let query = '';
    if (role === UserRole.STUDENT) {
      query = `SELECT ${selectColumns} FROM student s LEFT JOIN gender g ON s.Gender_ID = g.Gender_ID LEFT JOIN faculty f ON s.Faculty_ID = f.Faculty_ID LEFT JOIN branch b ON s.Branch_ID = b.Branch_ID WHERE s.Student_ID = ?`;
    } else {
      query = `SELECT ${selectColumns} FROM ${tableName} WHERE ${idColumn} = ?`;
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Register new student (for demo purposes)
 */
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      Student_ID,
      Student_Name,
      Student_Password,
      Faculty_ID,
      Branch_ID,
      Student_Email,
      Student_Phone,
      Gender_ID,
    } = req.body;

    // Validate input
    if (!Student_ID || !Student_Name || !Student_Password) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสนักศึกษา ชื่อ และรหัสผ่าน',
      });
      return;
    }

    // Validate student ID format (13 digits with dash: 076760305034-9)
    const studentIdRegex = /^\d{12}-\d$/;
    if (!studentIdRegex.test(Student_ID)) {
      res.status(400).json({
        success: false,
        message: 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง ตัวอย่าง: 076760305034-9',
      });
      return;
    }

    // Check if student already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT Student_ID FROM student WHERE Student_ID = ?',
      [Student_ID]
    );

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Student_Password, 10);

    // Insert student
    await pool.query(
      `INSERT INTO student (Student_ID, Student_Name, Student_Password, Faculty_ID, Branch_ID, Student_Email, Student_Phone, Gender_ID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Student_ID, Student_Name, hashedPassword, Faculty_ID, Branch_ID, Student_Email, Student_Phone, Gender_ID || null]
    );

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        Student_ID,
        Student_Name,
        Student_Email,
      },
    });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อน',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const { userId, role } = req.user;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่',
      });
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
      });
      return;
    }

    let tableName = '';
    let idColumn = '';
    let passwordColumn = '';

    // Determine table and columns based on role
    switch (role) {
      case UserRole.STUDENT:
        tableName = 'student';
        idColumn = 'Student_ID';
        passwordColumn = 'Student_Password';
        break;
      case UserRole.DEAN:
        tableName = 'dean';
        idColumn = 'Dean_ID';
        passwordColumn = 'Dean_Password';
        break;
      case UserRole.ACTIVITY_HEAD:
        tableName = 'activity_head';
        idColumn = 'Activity_Head_ID';
        passwordColumn = 'Activity_Head_Password';
        break;
      case UserRole.CLUB:
        tableName = 'club';
        idColumn = 'Club_ID';
        passwordColumn = 'Club_Password';
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'ประเภทผู้ใช้ไม่ถูกต้อง',
        });
        return;
    }

    // Get current password hash
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${passwordColumn} FROM ${tableName} WHERE ${idColumn} = ?`,
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, rows[0][passwordColumn]);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE ${tableName} SET ${passwordColumn} = ? WHERE ${idColumn} = ?`,
      [hashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
