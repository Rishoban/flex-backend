import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { ResponseUtils } from '@/utils/helpers';
import { config } from '@/config';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

export class AuthController {
  // Validation middleware for login
  static loginValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
  ];

  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(
          ResponseUtils.error('Validation failed', 400, errors.array())
        );
        return;
      }

      const { email, password } = req.body;

      // Check if credentials match hardcoded admin
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        res.status(401).json(
          ResponseUtils.error('Invalid email or password', 401)
        );
        return;
      }

      // Generate JWT token
      const payload = {
        id: '1',
        email: ADMIN_EMAIL,
        role: 'admin',
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      // Generate refresh token
      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
      } as jwt.SignOptions);

      const loginData = {
        token,
        refreshToken,
        user: {
          id: '1',
          email: ADMIN_EMAIL,
          role: 'admin',
        },
        expiresIn: config.jwt.expiresIn,
      };

      res.json(
        ResponseUtils.success('Login successful', loginData)
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(
        ResponseUtils.error('Internal server error', 500)
      );
    }
  }
}

export default AuthController;