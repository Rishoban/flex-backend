import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload } from '@/types';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTokens(payload: JwtPayload): { access: string; refresh: string } {
    const accessToken = (jwt.sign as any)(
      { ...payload }, 
      config.jwt.secret, 
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'flex-backend',
        audience: 'flex-users',
      }
    );

    const refreshToken = (jwt.sign as any)(
      { ...payload }, 
      config.jwt.refreshSecret, 
      {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'flex-backend',
        audience: 'flex-users',
      }
    );

    return { access: accessToken, refresh: refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'flex-backend',
      audience: 'flex-users',
    }) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'flex-backend',
      audience: 'flex-users',
    }) as JwtPayload;
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}