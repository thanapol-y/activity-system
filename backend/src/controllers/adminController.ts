import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { UserRole } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Helper: get table/column info by role
function getRoleConfig(role: string) {
  switch (role) {
    case 'student':
      return {
        table: 'student',
        idCol: 'Student_ID',
        nameCol: 'Student_Name',
        passwordCol: 'Student_Password',
        emailCol: 'Student_Email',
        selectCols: 'Student_ID, Student_Name, Student_Email, Student_Phone, Faculty_ID, Branch_ID',
      };
    case 'club':
      return {
        table: 'club',
        idCol: 'Club_ID',
        nameCol: 'Club_Name',
        passwordCol: 'Club_Password',
        emailCol: 'Club_Email',
        selectCols: 'Club_ID, Club_Name, Club_Email, Faculty_ID, Branch_ID',
      };
    case 'activity_head':
      return {
        table: 'activity_head',
        idCol: 'Activity_Head_ID',
        nameCol: 'Activity_Head_Name',
        passwordCol: 'Activity_Head_Password',
        emailCol: 'Activity_Head_Email',
        selectCols: 'Activity_Head_ID, Activity_Head_Name, Activity_Head_Email, Activity_Head_Phone, Department_ID',
      };
    case 'dean':
      return {
        table: 'dean',
        idCol: 'Dean_ID',
        nameCol: 'Dean_Name',
        passwordCol: 'Dean_Password',
        emailCol: 'Dean_Email',
        selectCols: 'Dean_ID, Dean_Name, Dean_Email, Department_ID',
      };
    default:
      return null;
  }
}

/**
 * Get users by role with search and pagination
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '15' } = req.query;

    if (!role || typeof role !== 'string') {
      res.status(400).json({ success: false, message: 'กรุณาระบุประเภทผู้ใช้' });
      return;
    }

    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 15;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      whereClause = `WHERE ${config.idCol} LIKE ? OR ${config.nameCol} LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ${config.table} ${whereClause}`,
      params
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get paginated data
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${config.selectCols} FROM ${config.table} ${whereClause} ORDER BY ${config.idCol} LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Get single user by role and id
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const id = req.params.id as string;
    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${config.selectCols} FROM ${config.table} WHERE ${config.idCol} = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
      return;
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin getUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Create user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const data = req.body;
    const id = data[config.idCol];
    const password = data.password;

    if (!id) {
      res.status(400).json({ success: false, message: 'กรุณาระบุรหัสผู้ใช้' });
      return;
    }
    if (!password) {
      res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผ่าน' });
      return;
    }

    // Check if exists
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT ${config.idCol} FROM ${config.table} WHERE ${config.idCol} = ?`,
      [id]
    );
    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'รหัสผู้ใช้นี้มีอยู่ในระบบแล้ว' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build insert dynamically
    const cols = config.selectCols.split(',').map(c => c.trim());
    const insertCols = [...cols, config.passwordCol];
    const values = cols.map(c => data[c] || null);
    values.push(hashedPassword);
    const placeholders = insertCols.map(() => '?').join(', ');

    await pool.query(
      `INSERT INTO ${config.table} (${insertCols.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({ success: true, message: 'เพิ่มผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Admin createUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const id = req.params.id as string;
    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const data = req.body;

    // Check if exists
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT ${config.idCol} FROM ${config.table} WHERE ${config.idCol} = ?`,
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
      return;
    }

    // Build update dynamically (exclude ID and password columns)
    const cols = config.selectCols.split(',').map(c => c.trim()).filter(c => c !== config.idCol);
    const setClauses: string[] = [];
    const values: any[] = [];

    for (const col of cols) {
      if (data[col] !== undefined) {
        setClauses.push(`${col} = ?`);
        values.push(data[col]);
      }
    }

    if (setClauses.length === 0) {
      res.status(400).json({ success: false, message: 'ไม่มีข้อมูลที่ต้องอัปเดต' });
      return;
    }

    values.push(id);
    await pool.query(
      `UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE ${config.idCol} = ?`,
      values
    );

    res.status(200).json({ success: true, message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Admin updateUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const id = req.params.id as string;
    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ${config.table} WHERE ${config.idCol} = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
      return;
    }

    res.status(200).json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const id = req.params.id as string;
    const { newPassword } = req.body;
    const config = getRoleConfig(role);
    if (!config) {
      res.status(400).json({ success: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${config.table} SET ${config.passwordCol} = ? WHERE ${config.idCol} = ?`,
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
      return;
    }

    res.status(200).json({ success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Admin resetPassword error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};

/**
 * Admin dashboard stats
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [students] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM student');
    const [clubs] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM club');
    const [activityHeads] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM activity_head');
    const [deans] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM dean');

    res.status(200).json({
      success: true,
      data: {
        userCounts: {
          student: students[0].count,
          club: clubs[0].count,
          activity_head: activityHeads[0].count,
          dean: deans[0].count,
        },
      },
    });
  } catch (error) {
    console.error('Admin getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
};
