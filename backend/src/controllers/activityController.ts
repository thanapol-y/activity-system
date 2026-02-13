import { Request, Response } from 'express';
import pool from '../config/database';
import { CreateActivityRequest, UpdateActivityRequest, ActivityStatus, UserRole } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Get all activity types
 */
export const getActivityTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const [types] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity_type ORDER BY Activity_Type_ID'
    );

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Create new activity (Activity Head only)
 */
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const {
      Activity_Name,
      Activity_Details,
      Academic_Year,
      Activity_Type_ID,
      Activity_Date,
      Activity_Time,
      Activity_Location,
      Maximum_Capacity,
      Deadline,
    } = req.body as CreateActivityRequest;

    // Validate required fields
    if (!Activity_Name || !Activity_Date || !Activity_Time || !Activity_Location || !Maximum_Capacity) {
      res.status(400).json({
        success: false,
        message: 'Required fields: Activity_Name, Activity_Date, Activity_Time, Activity_Location, Maximum_Capacity',
      });
      return;
    }

    // Validate Activity Type exists
    if (Activity_Type_ID) {
      const [typeRows] = await pool.query<RowDataPacket[]>(
        'SELECT Activity_Type_ID FROM activity_type WHERE Activity_Type_ID = ?',
        [Activity_Type_ID]
      );

      if (typeRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid Activity Type ID',
        });
        return;
      }
    }

    // Generate Activity ID (format: ACT + timestamp)
    const Activity_ID = `ACT${Date.now()}`;

    // Insert activity
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO activity (
        Activity_ID, Activity_Name, Activity_Details, Academic_Year,
        Activity_Type_ID, Activity_Date, Activity_Time, Activity_Location,
        Maximum_Capacity, Deadline, Activity_Status, Activity_Head_ID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Activity_ID,
        Activity_Name,
        Activity_Details,
        Academic_Year,
        Activity_Type_ID,
        Activity_Date,
        Activity_Time,
        Activity_Location,
        Maximum_Capacity,
        Deadline,
        ActivityStatus.PENDING,
        req.user.userId,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: {
        Activity_ID,
        Activity_Name,
        Activity_Status: ActivityStatus.PENDING,
      },
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all activities (with filters)
 */
export const getAllActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      type,
      search,
      page = '1',
      limit = '10',
      sortBy = 'Created_At',
      sortOrder = 'DESC',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push('a.Activity_Status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('a.Activity_Type_ID = ?');
      params.push(type);
    }

    if (search) {
      conditions.push('(a.Activity_Name LIKE ? OR a.Activity_Details LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter by role
    if (req.user) {
      if (req.user.role === UserRole.ACTIVITY_HEAD) {
        conditions.push('a.Activity_Head_ID = ?');
        params.push(req.user.userId);
      } else if (req.user.role === UserRole.DEAN) {
        conditions.push('(a.Dean_ID = ? OR a.Dean_ID IS NULL)');
        params.push(req.user.userId);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM activity a ${whereClause}`,
      params
    );

    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get activities with related data
    const query = `
      SELECT
        a.*,
        at.Activity_Type_Name,
        ah.Activity_Head_Name,
        ah.Activity_Head_Email,
        d.Dean_Name,
        (SELECT COUNT(*) FROM registration r WHERE r.Activity_ID = a.Activity_ID AND r.Registration_Status = 'registered') as Current_Registrations
      FROM activity a
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      LEFT JOIN activity_head ah ON a.Activity_Head_ID = ah.Activity_Head_ID
      LEFT JOIN dean d ON a.Dean_ID = d.Dean_ID
      ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [activities] = await pool.query<RowDataPacket[]>(query, [...params, limitNum, offset]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get activity by ID
 */
export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.*,
        at.Activity_Type_Name,
        ah.Activity_Head_Name,
        ah.Activity_Head_Email,
        ah.Activity_Head_Phone,
        d.Dean_Name,
        d.Dean_Email,
        (SELECT COUNT(*) FROM registration r WHERE r.Activity_ID = a.Activity_ID AND r.Registration_Status = 'registered') as Current_Registrations,
        (SELECT COUNT(*) FROM check_in ci WHERE ci.Activity_ID = a.Activity_ID) as Total_CheckIns
      FROM activity a
      LEFT JOIN activity_type at ON a.Activity_Type_ID = at.Activity_Type_ID
      LEFT JOIN activity_head ah ON a.Activity_Head_ID = ah.Activity_Head_ID
      LEFT JOIN dean d ON a.Dean_ID = d.Dean_ID
      WHERE a.Activity_ID = ?`,
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: activities[0],
    });
  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update activity (Activity Head only - own activities)
 */
export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const updates = req.body as UpdateActivityRequest;

    // Check if activity exists and belongs to the user (if Activity Head)
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    const activity = activities[0];

    // Only Activity Head can update their own activities
    if (req.user.role === UserRole.ACTIVITY_HEAD && activity.Activity_Head_ID !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own activities',
      });
      return;
    }

    // Cannot update approved or rejected activities
    if (activity.Activity_Status !== ActivityStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Cannot update ${activity.Activity_Status} activity`,
      });
      return;
    }

    // Validate Activity Type if provided
    if (updates.Activity_Type_ID) {
      const [typeRows] = await pool.query<RowDataPacket[]>(
        'SELECT Activity_Type_ID FROM activity_type WHERE Activity_Type_ID = ?',
        [updates.Activity_Type_ID]
      );

      if (typeRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid Activity Type ID',
        });
        return;
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.Activity_Name !== undefined) {
      updateFields.push('Activity_Name = ?');
      updateValues.push(updates.Activity_Name);
    }
    if (updates.Activity_Details !== undefined) {
      updateFields.push('Activity_Details = ?');
      updateValues.push(updates.Activity_Details);
    }
    if (updates.Activity_Type_ID !== undefined) {
      updateFields.push('Activity_Type_ID = ?');
      updateValues.push(updates.Activity_Type_ID);
    }
    if (updates.Activity_Date !== undefined) {
      updateFields.push('Activity_Date = ?');
      updateValues.push(updates.Activity_Date);
    }
    if (updates.Activity_Time !== undefined) {
      updateFields.push('Activity_Time = ?');
      updateValues.push(updates.Activity_Time);
    }
    if (updates.Activity_Location !== undefined) {
      updateFields.push('Activity_Location = ?');
      updateValues.push(updates.Activity_Location);
    }
    if (updates.Maximum_Capacity !== undefined) {
      updateFields.push('Maximum_Capacity = ?');
      updateValues.push(updates.Maximum_Capacity);
    }
    if (updates.Deadline !== undefined) {
      updateFields.push('Deadline = ?');
      updateValues.push(updates.Deadline);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
      return;
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE activity SET ${updateFields.join(', ')} WHERE Activity_ID = ?`,
      updateValues
    );

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete activity (Activity Head only - own activities, only if no registrations)
 */
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;

    // Check if activity exists and belongs to the user
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    const activity = activities[0];

    // Only Activity Head can delete their own activities
    if (req.user.role === UserRole.ACTIVITY_HEAD && activity.Activity_Head_ID !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own activities',
      });
      return;
    }

    // Check if there are any registrations
    const [registrations] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM registration WHERE Activity_ID = ? AND Registration_Status = ?',
      [id, 'registered']
    );

    if (registrations[0].count > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete activity with existing registrations',
      });
      return;
    }

    // Delete activity
    await pool.query('DELETE FROM activity WHERE Activity_ID = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Approve activity (Dean only)
 */
export const approveActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;

    // Check if activity exists
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    const activity = activities[0];

    // Check if activity is pending
    if (activity.Activity_Status !== ActivityStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Activity is already ${activity.Activity_Status}`,
      });
      return;
    }

    // Update activity status
    await pool.query(
      'UPDATE activity SET Activity_Status = ?, Dean_ID = ? WHERE Activity_ID = ?',
      [ActivityStatus.APPROVED, req.user.userId, id]
    );

    res.status(200).json({
      success: true,
      message: 'Activity approved successfully',
    });
  } catch (error) {
    console.error('Approve activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Reject activity (Dean only)
 */
export const rejectActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Check if activity exists
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    const activity = activities[0];

    // Check if activity is pending
    if (activity.Activity_Status !== ActivityStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Activity is already ${activity.Activity_Status}`,
      });
      return;
    }

    // Update activity status
    await pool.query(
      'UPDATE activity SET Activity_Status = ?, Dean_ID = ? WHERE Activity_ID = ?',
      [ActivityStatus.REJECTED, req.user.userId, id]
    );

    res.status(200).json({
      success: true,
      message: 'Activity rejected successfully',
      reason: reason || 'No reason provided',
    });
  } catch (error) {
    console.error('Reject activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get activity registrations (Activity Head, Club)
 */
export const getActivityRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if activity exists
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    // Get registrations with student details
    const [registrations] = await pool.query<RowDataPacket[]>(
      `SELECT
        r.*,
        s.Student_Name,
        s.Student_Email,
        s.Student_Phone,
        s.Faculty_ID,
        s.Branch_ID,
        f.Faculty_Name,
        b.Branch_Name,
        CASE WHEN ci.Student_ID IS NOT NULL THEN 1 ELSE 0 END as Has_CheckedIn,
        ci.CheckIn_Time
      FROM registration r
      INNER JOIN student s ON r.Student_ID = s.Student_ID
      LEFT JOIN faculty f ON s.Faculty_ID = f.Faculty_ID
      LEFT JOIN branch b ON s.Branch_ID = b.Branch_ID
      LEFT JOIN check_in ci ON r.Student_ID = ci.Student_ID AND r.Activity_ID = ci.Activity_ID
      WHERE r.Activity_ID = ? AND r.Registration_Status = 'registered'
      ORDER BY r.Registration_Date DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: registrations,
      count: registrations.length,
    });
  } catch (error) {
    console.error('Get activity registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Assign club to activity (Activity Head only)
 */
export const assignClubToActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const { Club_ID } = req.body;

    if (!Club_ID) {
      res.status(400).json({
        success: false,
        message: 'Club_ID is required',
      });
      return;
    }

    // Check if activity exists and belongs to the user
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity WHERE Activity_ID = ?',
      [id]
    );

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
      return;
    }

    const activity = activities[0];

    if (req.user.role === UserRole.ACTIVITY_HEAD && activity.Activity_Head_ID !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only assign clubs to your own activities',
      });
      return;
    }

    // Check if club exists
    const [clubs] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM club WHERE Club_ID = ?',
      [Club_ID]
    );

    if (clubs.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Club not found',
      });
      return;
    }

    // Check if assignment already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activity_assignment WHERE Activity_ID = ? AND Club_ID = ?',
      [id, Club_ID]
    );

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Club is already assigned to this activity',
      });
      return;
    }

    // Insert assignment
    await pool.query(
      'INSERT INTO activity_assignment (Activity_ID, Club_ID) VALUES (?, ?)',
      [id, Club_ID]
    );

    res.status(201).json({
      success: true,
      message: 'Club assigned to activity successfully',
    });
  } catch (error) {
    console.error('Assign club to activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get assigned clubs for activity
 */
export const getAssignedClubs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [clubs] = await pool.query<RowDataPacket[]>(
      `SELECT
        c.*,
        aa.Assigned_Date,
        f.Faculty_Name,
        b.Branch_Name
      FROM activity_assignment aa
      INNER JOIN club c ON aa.Club_ID = c.Club_ID
      LEFT JOIN faculty f ON c.Faculty_ID = f.Faculty_ID
      LEFT JOIN branch b ON c.Branch_ID = b.Branch_ID
      WHERE aa.Activity_ID = ?
      ORDER BY aa.Assigned_Date DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: clubs,
    });
  } catch (error) {
    console.error('Get assigned clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
