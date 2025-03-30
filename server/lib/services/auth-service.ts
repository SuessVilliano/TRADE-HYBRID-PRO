
import jwt from 'jsonwebtoken';
import { env } from '../env';

export class AuthService {
  static generateToken(userId: string, accountId: string) {
    return jwt.sign(
      { userId, accountId },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
}
