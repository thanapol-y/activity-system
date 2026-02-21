import { Request, Response } from "express";
import pool from "../config/database";
import {
  generateQRCodeImage,
  parseQRCodeData,
  validateQRCodeData,
} from "../utils/qrcode";
import { UserRole, RegistrationStatus, ActivityStatus } from "../types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Register student for activity
 */
export const registerForActivity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const { Activity_ID } = req.body;
    const Student_ID = req.user.userId;

    if (!Activity_ID) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุรหัสกิจกรรม",
      });
      return;
    }

    // Check if activity exists and is approved
    const [activities] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM activity WHERE Activity_ID = ?",
      [Activity_ID],
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบกิจกรรมที่ระบุ",
      });
      return;
    }

    const activity = activities[0];

    if (activity.Activity_Status !== ActivityStatus.APPROVED) {
      res.status(400).json({
        success: false,
        message: "กิจกรรมยังไม่ได้รับการอนุมัติ",
      });
      return;
    }

    // Check if deadline has passed
    if (activity.Deadline && new Date(activity.Deadline) < new Date()) {
      res.status(400).json({
        success: false,
        message: "หมดเวลาลงทะเบียนแล้ว",
      });
      return;
    }

    // Check if already registered
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM registration WHERE Student_ID = ? AND Activity_ID = ?",
      [Student_ID, Activity_ID],
    );

    if (existing.length > 0) {
      if (existing[0].Registration_Status === RegistrationStatus.REGISTERED) {
        res.status(409).json({
          success: false,
          message: "คุณลงทะเบียนกิจกรรมนี้แล้ว",
        });
        return;
      } else {
        // Re-register cancelled registration
        await pool.query(
          "UPDATE registration SET Registration_Status = ?, Registration_Date = NOW() WHERE Student_ID = ? AND Activity_ID = ?",
          [RegistrationStatus.REGISTERED, Student_ID, Activity_ID],
        );

        res.status(200).json({
          success: true,
          message: "ลงทะเบียนกิจกรรมอีกครั้งสำเร็จ",
        });
        return;
      }
    }

    // Check if activity is full
    const [countRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM registration WHERE Activity_ID = ? AND Registration_Status = ?",
      [Activity_ID, RegistrationStatus.REGISTERED],
    );

    if (countRows[0].count >= activity.Maximum_Capacity) {
      res.status(400).json({
        success: false,
        message: "กิจกรรมเต็มแล้ว",
      });
      return;
    }

    // Generate QR code
    const qrCodeData = await generateQRCodeImage(Student_ID, Activity_ID);

    // Insert registration
    await pool.query(
      "INSERT INTO registration (Student_ID, Activity_ID, QR_Code_Data, Registration_Status) VALUES (?, ?, ?, ?)",
      [Student_ID, Activity_ID, qrCodeData, RegistrationStatus.REGISTERED],
    );

    res.status(201).json({
      success: true,
      message: "ลงทะเบียนกิจกรรมสำเร็จ",
      data: {
        Activity_ID,
        Student_ID,
        QR_Code: qrCodeData,
      },
    });
  } catch (error) {
    console.error("Register for activity error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cancel registration
 */
export const cancelRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const { Activity_ID } = req.body;
    const Student_ID = req.user.userId;

    if (!Activity_ID) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุรหัสกิจกรรม",
      });
      return;
    }

    // Check if registration exists
    const [registrations] = await pool.query<RowDataPacket[]>(
      "SELECT r.*, a.Activity_Date, a.Deadline FROM registration r INNER JOIN activity a ON r.Activity_ID = a.Activity_ID WHERE r.Student_ID = ? AND r.Activity_ID = ?",
      [Student_ID, Activity_ID],
    );

    if (registrations.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลการลงทะเบียน",
      });
      return;
    }

    const registration = registrations[0];

    if (registration.Registration_Status === RegistrationStatus.CANCELLED) {
      res.status(400).json({
        success: false,
        message: "การลงทะเบียนถูกยกเลิกแล้ว",
      });
      return;
    }

    // Check if cancellation is allowed (e.g., before deadline or activity date)
    const now = new Date();
    const activityDate = new Date(registration.Activity_Date);

    // Allow cancellation up to 1 day before activity
    const oneDayBeforeActivity = new Date(activityDate);
    oneDayBeforeActivity.setDate(oneDayBeforeActivity.getDate() - 1);

    if (now > oneDayBeforeActivity) {
      res.status(400).json({
        success: false,
        message:
          "ไม่สามารถยกเลิกการลงทะเบียนได้ เนื่องจากเหลือเวลาน้อยกว่า 24 ชั่วโมงก่อนเริ่มกิจกรรม",
      });
      return;
    }

    // Check if already checked in
    const [checkins] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM check_in WHERE Student_ID = ? AND Activity_ID = ?",
      [Student_ID, Activity_ID],
    );

    if (checkins.length > 0) {
      res.status(400).json({
        success: false,
        message: "ไม่สามารถยกเลิกได้ เนื่องจากเช็คอินแล้ว",
      });
      return;
    }

    // Update registration status
    await pool.query(
      "UPDATE registration SET Registration_Status = ? WHERE Student_ID = ? AND Activity_ID = ?",
      [RegistrationStatus.CANCELLED, Student_ID, Activity_ID],
    );

    res.status(200).json({
      success: true,
      message: "ยกเลิกการลงทะเบียนสำเร็จ",
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get student's registrations
 */
export const getMyRegistrations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const Student_ID = req.user.userId;
    const { status } = req.query;

    let query = `
      SELECT
        r.*,
        a.Activity_Name,
        a.Activity_Details,
        a.Activity_Date,
        a.Activity_Time,
        a.Activity_Location,
        a.Activity_Status,
        a.Activity_Hours,
        a.Maximum_Capacity,
        at.Activity_Type_Name,
        CASE WHEN ci.Student_ID IS NOT NULL THEN 1 ELSE 0 END as Has_CheckedIn,
        ci.CheckIn_Time
      FROM registration r
      INNER JOIN activity a ON r.Activity_ID = a.Activity_ID
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      LEFT JOIN check_in ci ON r.Student_ID = ci.Student_ID AND r.Activity_ID = ci.Activity_ID
      WHERE r.Student_ID = ?
    `;

    const params: any[] = [Student_ID];

    if (status) {
      query += " AND r.Registration_Status = ?";
      params.push(status);
    }

    query += " ORDER BY r.Registration_Date DESC";

    const [registrations] = await pool.query<RowDataPacket[]>(query, params);

    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Get my registrations error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get QR code for specific registration
 */
export const getQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const { activityId } = req.params;
    const activityIdStr =
      typeof activityId === "string" ? activityId : activityId[0];
    const Student_ID = req.user.userId;

    // Check if registration exists
    const [registrations] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM registration WHERE Student_ID = ? AND Activity_ID = ? AND Registration_Status = ?",
      [Student_ID, activityIdStr, RegistrationStatus.REGISTERED],
    );

    if (registrations.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลการลงทะเบียน",
      });
      return;
    }

    const registration = registrations[0];

    // Generate new QR code if not exists
    let qrCode = registration.QR_Code_Data;
    if (!qrCode) {
      qrCode = await generateQRCodeImage(Student_ID, activityIdStr);

      // Update database
      await pool.query(
        "UPDATE registration SET QR_Code_Data = ? WHERE Student_ID = ? AND Activity_ID = ?",
        [qrCode, Student_ID, activityIdStr],
      );
    }

    res.status(200).json({
      success: true,
      data: {
        qrCode,
        Student_ID,
        Activity_ID: activityIdStr,
      },
    });
  } catch (error) {
    console.error("Get QR code error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Check check-in status for a specific activity (Student polling)
 */
export const getCheckInStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบก่อน" });
      return;
    }

    const { activityId } = req.params;
    const Student_ID = req.user.userId;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ci.CheckIn_Time, a.Activity_Name, a.Activity_Hours
       FROM check_in ci
       INNER JOIN activity a ON ci.Activity_ID = a.Activity_ID
       WHERE ci.Student_ID = ? AND ci.Activity_ID = ?`,
      [Student_ID, activityId],
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        data: {
          checkedIn: true,
          CheckIn_Time: rows[0].CheckIn_Time,
          Activity_Name: rows[0].Activity_Name,
          Activity_Hours: rows[0].Activity_Hours || 3,
        },
      });
    } else {
      res.json({
        success: true,
        data: { checkedIn: false },
      });
    }
  } catch (error) {
    console.error("Get check-in status error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

/**
 * Check-in student with QR code (Club only)
 */
export const checkInWithQRCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const { qrData } = req.body;
    const Club_ID = req.user.userId;

    if (!qrData) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุข้อมูล QR Code",
      });
      return;
    }

    // Parse QR code data
    const parsedData = parseQRCodeData(qrData);

    if (!parsedData) {
      res.status(400).json({
        success: false,
        message: "รูปแบบ QR Code ไม่ถูกต้อง",
      });
      return;
    }

    // Validate QR code
    const validation = validateQRCodeData(parsedData);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.message,
      });
      return;
    }

    const { studentId, activityId } = parsedData;

    // Check if activity exists and is approved
    const [activityRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM activity WHERE Activity_ID = ? AND Activity_Status = 'approved'",
      [activityId],
    );

    if (activityRows.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบกิจกรรมหรือกิจกรรมยังไม่ได้รับการอนุมัติ",
      });
      return;
    }

    // Check if registration exists
    const [registrations] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM registration WHERE Student_ID = ? AND Activity_ID = ? AND Registration_Status = ?",
      [studentId, activityId, RegistrationStatus.REGISTERED],
    );

    if (registrations.length === 0) {
      res.status(404).json({
        success: false,
        message: "นักศึกษาไม่ได้ลงทะเบียนกิจกรรมนี้",
      });
      return;
    }

    // Check if already checked in
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM check_in WHERE Student_ID = ? AND Activity_ID = ?",
      [studentId, activityId],
    );

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        message: "นักศึกษาเช็คอินแล้ว",
        data: {
          CheckIn_Time: existing[0].CheckIn_Time,
        },
      });
      return;
    }

    // Insert check-in record
    await pool.query(
      "INSERT INTO check_in (Student_ID, Activity_ID, Club_ID, CheckIn_Time) VALUES (?, ?, ?, NOW())",
      [studentId, activityId, Club_ID],
    );

    // Get student info
    const [students] = await pool.query<RowDataPacket[]>(
      "SELECT Student_ID, Student_Name, Student_Email FROM student WHERE Student_ID = ?",
      [studentId],
    );

    res.status(201).json({
      success: true,
      message: "เช็คอินสำเร็จ",
      data: {
        Student_ID: studentId,
        Student_Name: students[0]?.Student_Name,
        Activity_ID: activityId,
        CheckIn_Time: new Date(),
      },
    });
  } catch (error) {
    console.error("Check-in with QR code error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get check-in history (Club)
 */
export const getCheckInHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const { activityId } = req.params;
    const activityIdStr =
      typeof activityId === "string" ? activityId : activityId[0];
    const Club_ID = req.user.userId;

    // Get check-in history
    const [checkIns] = await pool.query<RowDataPacket[]>(
      `SELECT
        ci.*,
        s.Student_Name,
        s.Student_Email,
        s.Student_Phone,
        f.Faculty_Name,
        b.Branch_Name
      FROM check_in ci
      INNER JOIN student s ON ci.Student_ID = s.Student_ID
      LEFT JOIN faculty f ON s.Faculty_ID = f.Faculty_ID
      LEFT JOIN branch b ON s.Branch_ID = b.Branch_ID
      WHERE ci.Activity_ID = ? AND ci.Club_ID = ?
      ORDER BY ci.CheckIn_Time DESC`,
      [activityIdStr, Club_ID],
    );

    res.status(200).json({
      success: true,
      data: checkIns,
      count: checkIns.length,
    });
  } catch (error) {
    console.error("Get check-in history error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get student's activity history
 */
export const getActivityHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      });
      return;
    }

    const Student_ID = req.user.userId;

    const [history] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.Activity_ID,
        a.Activity_Name,
        a.Activity_Date,
        a.Activity_Time,
        a.Activity_Location,
        a.Activity_Hours,
        a.Activity_Type_ID,
        at.Activity_Type_Name,
        r.Registration_Date,
        r.Student_ID,
        ci.CheckIn_Time,
        CASE WHEN ci.Student_ID IS NOT NULL THEN 1 ELSE 0 END as Has_CheckedIn
      FROM registration r
      INNER JOIN activity a ON r.Activity_ID = a.Activity_ID
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      LEFT JOIN check_in ci ON r.Student_ID = ci.Student_ID AND r.Activity_ID = ci.Activity_ID
      WHERE r.Student_ID = ? AND r.Registration_Status = ?
      ORDER BY a.Activity_Date DESC`,
      [Student_ID, RegistrationStatus.REGISTERED],
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get activity history error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
