import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { UserRole, JWTPayload } from '../types';

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: userRole,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is Dean
 */
export const isDean = authorize(UserRole.DEAN);

/**
 * Middleware to check if user is Activity Head
 */
export const isActivityHead = authorize(UserRole.ACTIVITY_HEAD);

/**
 * Middleware to check if user is Club
 */
export const isClub = authorize(UserRole.CLUB);

/**
 * Middleware to check if user is Student
 */
export const isStudent = authorize(UserRole.STUDENT);

/**
 * Middleware to check if user is Admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Middleware to check if user is Activity Head or Dean
 */
export const isActivityHeadOrDean = authorize(UserRole.ACTIVITY_HEAD, UserRole.DEAN);

/**
 * Middleware to check if user is Club or Activity Head
 */
export const isClubOrActivityHead = authorize(UserRole.CLUB, UserRole.ACTIVITY_HEAD);

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
