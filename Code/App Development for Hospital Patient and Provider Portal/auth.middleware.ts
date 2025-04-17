import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: any;
}

// Middleware to verify JWT token
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is a patient
export const isPatient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.PATIENT) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Patient role required.' });
  }
};

// Middleware to check if user is a provider
export const isProvider = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.PROVIDER) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Provider role required.' });
  }
};

// Middleware to check if user is either a patient or a provider
export const isPatientOrProvider = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === UserRole.PATIENT || req.user.role === UserRole.PROVIDER)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Patient or Provider role required.' });
  }
};
