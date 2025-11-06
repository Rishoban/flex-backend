import { body, query, param, ValidationChain } from 'express-validator';
import { ValidationUtils } from '@/utils/helpers';

export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .custom((value) => {
      if (!ValidationUtils.isStrongPassword(value)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number and special character');
      }
      return true;
    }),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must contain only letters and spaces'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must contain only letters and spaces'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateUpdateProfile: ValidationChain[] = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must contain only letters and spaces'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must contain only letters and spaces'),
];

export const validateChangePassword: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom((value) => {
      if (!ValidationUtils.isStrongPassword(value)) {
        throw new Error('New password must be at least 8 characters with uppercase, lowercase, number and special character');
      }
      return true;
    }),
];

export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be a valid string'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
];

export const validateObjectId: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const validateEmail: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

export const validatePasswordReset: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .custom((value) => {
      if (!ValidationUtils.isStrongPassword(value)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number and special character');
      }
      return true;
    }),
];