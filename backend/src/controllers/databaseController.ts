import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Tables that can be managed, with display names
const MANAGED_TABLES: Record<string, { label: string; primaryKey: string | string[] }> = {
  faculty: { label: 'คณะ', primaryKey: 'Faculty_ID' },
  branch: { label: 'สาขา', primaryKey: 'Branch_ID' },
  department: { label: 'ภาควิชา', primaryKey: 'Department_ID' },
  activity_type: { label: 'ประเภทกิจกรรม', primaryKey: 'Activity_Type_ID' },
  gender: { label: 'เพศ', primaryKey: 'Gender_ID' },
  admin: { label: 'ผู้ดูแลระบบ', primaryKey: 'Admin_ID' },
  student: { label: 'นักศึกษา', primaryKey: 'Student_ID' },
  dean: { label: 'รองคณบดี', primaryKey: 'Dean_ID' },
  activity_head: { label: 'หัวหน้ากิจกรรม', primaryKey: 'Activity_Head_ID' },
  club: { label: 'สโมสร', primaryKey: 'Club_ID' },
  activity: { label: 'กิจกรรม', primaryKey: 'Activity_ID' },
  registration: { label: 'การลงทะเบียน', primaryKey: ['Student_ID', 'Activity_ID'] },
  check_in: { label: 'การเช็คอิน', primaryKey: ['Student_ID', 'Activity_ID'] },
  problem_report: { label: 'รายงานปัญหา', primaryKey: 'Report_ID' },
};

// Password columns to hide
const PASSWORD_COLS = ['Admin_Password', 'Student_Password', 'Dean_Password', 'Activity_Head_Password', 'Club_Password'];

/**
 * Get list of all tables with row counts
 */
export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = [];
    for (const [tableName, meta] of Object.entries(MANAGED_TABLES)) {
      try {
        const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM ${tableName}`);
        tables.push({ name: tableName, label: meta.label, count: rows[0].count, primaryKey: meta.primaryKey });
      } catch {
        tables.push({ name: tableName, label: meta.label, count: 0, primaryKey: meta.primaryKey });
      }
    }
    res.json({ success: true, data: tables });
  } catch (error) {
    console.error('getTables error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

/**
 * Get all rows from a table (with optional search)
 */
export const getTableData = async (req: Request, res: Response): Promise<void> => {
  try {
    const table = req.params.table as string;
    const { search, page = '1', limit = '50' } = req.query;

    if (!MANAGED_TABLES[table]) {
      res.status(400).json({ success: false, message: 'ตารางไม่ถูกต้อง' });
      return;
    }

    // Get columns info
    const [colRows] = await pool.query<RowDataPacket[]>(`SHOW COLUMNS FROM ${table}`);
    const columns = colRows.map((c: any) => ({
      name: c.Field,
      type: c.Type,
      nullable: c.Null === 'YES',
      key: c.Key,
      default: c.Default,
      isPassword: PASSWORD_COLS.includes(c.Field),
    }));

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Select all columns except password (show as '***')
    const selectCols = columns.map((c: any) =>
      c.isPassword ? `'***' as ${c.name}` : c.name
    ).join(', ');

    let whereClause = '';
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const searchableCols = columns.filter((c: any) => !c.isPassword);
      const conditions = searchableCols.map((c: any) => `CAST(${c.name} AS CHAR) LIKE ?`);
      whereClause = `WHERE ${conditions.join(' OR ')}`;
      params.push(...searchableCols.map(() => `%${search}%`));
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ${table} ${whereClause}`, params
    );
    const totalItems = countRows[0].total;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${selectCols} FROM ${table} ${whereClause} LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        columns,
        rows,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('getTableData error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

/**
 * Update a row in a table
 */
export const updateRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const table = req.params.table as string;
    const { primaryKeyValues, data } = req.body;

    if (!MANAGED_TABLES[table]) {
      res.status(400).json({ success: false, message: 'ตารางไม่ถูกต้อง' });
      return;
    }

    // Filter out password columns and primary key from update data
    const pk = MANAGED_TABLES[table].primaryKey;
    const pkCols = Array.isArray(pk) ? pk : [pk];
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!PASSWORD_COLS.includes(key) && !pkCols.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'ไม่มีข้อมูลที่ต้องอัปเดต' });
      return;
    }

    const setClauses = Object.keys(updateData).map(k => `${k} = ?`);
    const values = Object.values(updateData);

    const whereClauses = pkCols.map(k => `${k} = ?`);
    const whereValues = pkCols.map(k => primaryKeyValues[k]);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`,
      [...values, ...whereValues]
    );

    res.json({ success: true, message: `อัปเดตสำเร็จ (${result.affectedRows} แถว)` });
  } catch (error) {
    console.error('updateRow error:', error);
    res.status(500).json({ success: false, message: (error as Error).message || 'เกิดข้อผิดพลาด' });
  }
};

/**
 * Delete a row from a table
 */
export const deleteRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const table = req.params.table as string;
    const { primaryKeyValues } = req.body;

    if (!MANAGED_TABLES[table]) {
      res.status(400).json({ success: false, message: 'ตารางไม่ถูกต้อง' });
      return;
    }

    const pk = MANAGED_TABLES[table].primaryKey;
    const pkCols = Array.isArray(pk) ? pk : [pk];

    // For tables with FK constraints, delete related data first
    if (table === 'activity') {
      await pool.query('DELETE FROM check_in WHERE Activity_ID = ?', [primaryKeyValues['Activity_ID']]);
      await pool.query('DELETE FROM registration WHERE Activity_ID = ?', [primaryKeyValues['Activity_ID']]);
      await pool.query('DELETE FROM problem_report WHERE Activity_ID = ?', [primaryKeyValues['Activity_ID']]);
    }

    const whereClauses = pkCols.map(k => `${k} = ?`);
    const whereValues = pkCols.map(k => primaryKeyValues[k]);

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`,
      whereValues
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ' });
      return;
    }

    res.json({ success: true, message: `ลบสำเร็จ (${result.affectedRows} แถว)` });
  } catch (error) {
    console.error('deleteRow error:', error);
    res.status(500).json({ success: false, message: (error as Error).message || 'เกิดข้อผิดพลาด ตรวจสอบว่าไม่มีข้อมูลอื่นอ้างอิงถึงแถวนี้' });
  }
};

/**
 * Execute raw SQL - supports multiple statements separated by semicolons
 */
export const executeQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      res.status(400).json({ success: false, message: 'กรุณาระบุ SQL query' });
      return;
    }

    // Split into individual statements, remove comments and empty lines
    const statements = sql
      .split(/;\s*\n|;\s*$/)
      .map(s => s.replace(/--.*$/gm, '').trim())
      .filter(s => s.length > 0 && !s.toUpperCase().startsWith('USE '));

    if (statements.length === 0) {
      res.status(400).json({ success: false, message: 'ไม่พบ SQL statement ที่ถูกต้อง' });
      return;
    }

    const ALLOWED_PREFIXES = ['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'SET'];

    // Validate all statements first
    for (const stmt of statements) {
      const upper = stmt.toUpperCase();
      const isAllowed = ALLOWED_PREFIXES.some(p => upper.startsWith(p));
      if (!isAllowed) {
        res.status(400).json({ success: false, message: `คำสั่งไม่อนุญาต: ${stmt.substring(0, 50)}...` });
        return;
      }
    }

    // Execute single statement
    if (statements.length === 1) {
      const stmt = statements[0];
      const upper = stmt.toUpperCase();
      const isReadOnly = upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('DESCRIBE') || upper.startsWith('DESC');

      const [rows] = await pool.query(stmt);

      if (isReadOnly) {
        res.json({ success: true, data: rows });
      } else {
        const result = rows as ResultSetHeader;
        res.json({ success: true, message: `สำเร็จ (affected: ${result.affectedRows})`, data: [] });
      }
      return;
    }

    // Execute multiple statements
    let totalAffected = 0;
    let successCount = 0;
    let lastSelectResult: any = null;

    for (const stmt of statements) {
      const upper = stmt.toUpperCase();
      const isReadOnly = upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('DESCRIBE') || upper.startsWith('DESC');

      const [rows] = await pool.query(stmt);

      if (isReadOnly) {
        lastSelectResult = rows;
      } else {
        const result = rows as ResultSetHeader;
        totalAffected += result.affectedRows || 0;
      }
      successCount++;
    }

    res.json({
      success: true,
      message: `สำเร็จ ${successCount}/${statements.length} คำสั่ง (affected rows: ${totalAffected})`,
      data: lastSelectResult || [],
    });
  } catch (error) {
    console.error('executeQuery error:', error);
    res.status(500).json({ success: false, message: (error as Error).message || 'SQL Error' });
  }
};
