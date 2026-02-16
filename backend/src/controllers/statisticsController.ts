import { Request, Response } from "express";
import pool from "../config/database";
import { RowDataPacket } from "mysql2";

/**
 * Get overall statistics (Dean dashboard)
 */
export const getOverallStatistics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get total activities
    const [totalActivities] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM activity",
    );

    // Get activities by status
    const [activitiesByStatus] = await pool.query<RowDataPacket[]>(
      "SELECT Activity_Status, COUNT(*) as count FROM activity GROUP BY Activity_Status",
    );

    // Get total registrations
    const [totalRegistrations] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM registration WHERE Registration_Status = 'registered'",
    );

    // Get total check-ins
    const [totalCheckIns] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM check_in",
    );

    // Get activities by type
    const [activitiesByType] = await pool.query<RowDataPacket[]>(
      `SELECT
        at.Activity_Type_Name as type,
        COUNT(*) as count
      FROM activity a
      INNER JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      GROUP BY at.Activity_Type_Name
      ORDER BY count DESC`,
    );

    // Get total students
    const [totalStudents] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM student",
    );

    // Get active students (students who registered for at least one activity)
    const [activeStudents] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT Student_ID) as total FROM registration WHERE Registration_Status = 'registered'",
    );

    // Get top activities by registrations
    const [topActivities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.Activity_ID,
        a.Activity_Name,
        a.Activity_Date,
        COUNT(r.Student_ID) as registration_count,
        a.Maximum_Capacity
      FROM activity a
      LEFT JOIN registration r ON a.Activity_ID = r.Activity_ID AND r.Registration_Status = 'registered'
      WHERE a.Activity_Status = 'approved'
      GROUP BY a.Activity_ID, a.Activity_Name, a.Activity_Date, a.Maximum_Capacity
      ORDER BY registration_count DESC
      LIMIT 10`,
    );

    // Get monthly activity trend (last 6 months)
    const [monthlyTrend] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE_FORMAT(Activity_Date, '%Y-%m') as month,
        COUNT(*) as count
      FROM activity
      WHERE Activity_Date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(Activity_Date, '%Y-%m')
      ORDER BY month DESC`,
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActivities: totalActivities[0].total,
          totalRegistrations: totalRegistrations[0].total,
          totalCheckIns: totalCheckIns[0].total,
          totalStudents: totalStudents[0].total,
          activeStudents: activeStudents[0].total,
        },
        activitiesByStatus: activitiesByStatus,
        activitiesByType: activitiesByType,
        topActivities: topActivities,
        monthlyTrend: monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Get overall statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get activity statistics by ID
 */
export const getActivityStatistics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get activity details
    const [activities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.*,
        at.Activity_Type_Name,
        ah.Activity_Head_Name
      FROM activity a
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      LEFT JOIN activity_head ah ON a.Activity_Head_ID = ah.Activity_Head_ID
      WHERE a.Activity_ID = ?`,
      [id],
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: "Activity not found",
      });
      return;
    }

    const activity = activities[0];

    // Get registration count
    const [registrationCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM registration WHERE Activity_ID = ? AND Registration_Status = 'registered'",
      [id],
    );

    // Get check-in count
    const [checkInCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM check_in WHERE Activity_ID = ?",
      [id],
    );

    // Get registration by faculty
    const [registrationByFaculty] = await pool.query<RowDataPacket[]>(
      `SELECT
        f.Faculty_Name,
        COUNT(r.Student_ID) as count
      FROM registration r
      INNER JOIN student s ON r.Student_ID = s.Student_ID
      INNER JOIN faculty f ON s.Faculty_ID = f.Faculty_ID
      WHERE r.Activity_ID = ? AND r.Registration_Status = 'registered'
      GROUP BY f.Faculty_Name
      ORDER BY count DESC`,
      [id],
    );

    // Get registration by branch
    const [registrationByBranch] = await pool.query<RowDataPacket[]>(
      `SELECT
        b.Branch_Name,
        COUNT(r.Student_ID) as count
      FROM registration r
      INNER JOIN student s ON r.Student_ID = s.Student_ID
      INNER JOIN branch b ON s.Branch_ID = b.Branch_ID
      WHERE r.Activity_ID = ? AND r.Registration_Status = 'registered'
      GROUP BY b.Branch_Name
      ORDER BY count DESC`,
      [id],
    );

    // Get attendance rate
    const attendanceRate =
      registrationCount[0].count > 0
        ? parseFloat(
            (
              (checkInCount[0].count / registrationCount[0].count) *
              100
            ).toFixed(2),
          )
        : 0;

    // Get capacity utilization
    const capacityUtilization =
      activity.Maximum_Capacity > 0
        ? parseFloat(
            (
              (registrationCount[0].count / activity.Maximum_Capacity) *
              100
            ).toFixed(2),
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        activity: {
          Activity_ID: activity.Activity_ID,
          Activity_Name: activity.Activity_Name,
          Activity_Date: activity.Activity_Date,
          Activity_Time: activity.Activity_Time,
          Activity_Location: activity.Activity_Location,
          Activity_Type_Name: activity.Activity_Type_Name,
          Activity_Head_Name: activity.Activity_Head_Name,
          Maximum_Capacity: activity.Maximum_Capacity,
          Activity_Status: activity.Activity_Status,
        },
        statistics: {
          totalRegistrations: registrationCount[0].count,
          totalCheckIns: checkInCount[0].count,
          attendanceRate: attendanceRate,
          capacityUtilization: capacityUtilization,
        },
        registrationByFaculty: registrationByFaculty,
        registrationByBranch: registrationByBranch,
      },
    });
  } catch (error) {
    console.error("Get activity statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get dean's approval history
 */
export const getDeanApprovalHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const Dean_ID = req.user.userId;
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = ["a.Dean_ID = ?"];
    const params: any[] = [Dean_ID];

    if (status) {
      conditions.push("a.Activity_Status = ?");
      params.push(status);
    } else {
      conditions.push("a.Activity_Status IN ('approved', 'rejected')");
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM activity a ${whereClause}`,
      params,
    );

    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get approval history
    const [history] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.Activity_ID,
        a.Activity_Name,
        a.Activity_Date,
        a.Activity_Status,
        a.Updated_At as Decision_Date,
        ah.Activity_Head_Name,
        ah.Activity_Head_Email,
        at.Activity_Type_Name
      FROM activity a
      INNER JOIN activity_head ah ON a.Activity_Head_ID = ah.Activity_Head_ID
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      ${whereClause}
      ORDER BY a.Updated_At DESC
      LIMIT ? OFFSET ?`,
      [...params, limitNum, offset],
    );

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Get dean approval history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get activity head statistics
 */
export const getActivityHeadStatistics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const Activity_Head_ID = req.user.userId;

    // Get total activities created
    const [totalActivities] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM activity WHERE Activity_Head_ID = ?",
      [Activity_Head_ID],
    );

    // Get activities by status
    const [activitiesByStatus] = await pool.query<RowDataPacket[]>(
      "SELECT Activity_Status, COUNT(*) as count FROM activity WHERE Activity_Head_ID = ? GROUP BY Activity_Status",
      [Activity_Head_ID],
    );

    // Get total registrations for all activities
    const [totalRegistrations] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM registration r
       INNER JOIN activity a ON r.Activity_ID = a.Activity_ID
       WHERE a.Activity_Head_ID = ? AND r.Registration_Status = 'registered'`,
      [Activity_Head_ID],
    );

    // Get total check-ins for all activities
    const [totalCheckIns] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM check_in ci
       INNER JOIN activity a ON ci.Activity_ID = a.Activity_ID
       WHERE a.Activity_Head_ID = ?`,
      [Activity_Head_ID],
    );

    // Get upcoming activities
    const [upcomingActivities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.Activity_ID,
        a.Activity_Name,
        a.Activity_Date,
        a.Activity_Time,
        a.Activity_Status,
        COUNT(r.Student_ID) as registration_count,
        a.Maximum_Capacity
      FROM activity a
      LEFT JOIN registration r ON a.Activity_ID = r.Activity_ID AND r.Registration_Status = 'registered'
      WHERE a.Activity_Head_ID = ? AND a.Activity_Date >= CURDATE()
      GROUP BY a.Activity_ID, a.Activity_Name, a.Activity_Date, a.Activity_Time, a.Activity_Status, a.Maximum_Capacity
      ORDER BY a.Activity_Date ASC
      LIMIT 10`,
      [Activity_Head_ID],
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActivities: totalActivities[0].total,
          totalRegistrations: totalRegistrations[0].total,
          totalCheckIns: totalCheckIns[0].total,
        },
        activitiesByStatus: activitiesByStatus,
        upcomingActivities: upcomingActivities,
      },
    });
  } catch (error) {
    console.error("Get activity head statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get club statistics
 */
export const getClubStatistics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const Club_ID = req.user.userId;

    // Get total approved activities
    const [totalActivities] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM activity WHERE Activity_Status = 'approved'",
    );

    // Get total check-ins performed
    const [totalCheckIns] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM check_in WHERE Club_ID = ?",
      [Club_ID],
    );

    // Get upcoming approved activities
    const [upcomingActivities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.Activity_ID,
        a.Activity_Name,
        a.Activity_Date,
        a.Activity_Time,
        a.Activity_Location,
        COUNT(r.Student_ID) as expected_participants,
        (SELECT COUNT(*) FROM check_in WHERE Activity_ID = a.Activity_ID) as checked_in_count
      FROM activity a
      LEFT JOIN registration r ON a.Activity_ID = r.Activity_ID AND r.Registration_Status = 'registered'
      WHERE a.Activity_Status = 'approved' AND a.Activity_Date >= CURDATE()
      GROUP BY a.Activity_ID, a.Activity_Name, a.Activity_Date, a.Activity_Time, a.Activity_Location
      ORDER BY a.Activity_Date ASC
      LIMIT 10`,
    );

    // Get check-in activity by date (last 7 days)
    const [recentCheckIns] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE(CheckIn_Time) as date,
        COUNT(*) as count
      FROM check_in
      WHERE Club_ID = ? AND CheckIn_Time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(CheckIn_Time)
      ORDER BY date DESC`,
      [Club_ID],
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActivities: totalActivities[0].total,
          totalCheckIns: totalCheckIns[0].total,
        },
        upcomingActivities: upcomingActivities,
        recentCheckIns: recentCheckIns,
      },
    });
  } catch (error) {
    console.error("Get club statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
