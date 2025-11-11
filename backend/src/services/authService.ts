import jwt from 'jsonwebtoken';
import { User, TokenBlacklist } from '../models';
import { config } from '../config/app';

export class AuthService {
  static async registerUser(userData: {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
  }) {
    const { full_name, email, phone_number, password } = userData;

    // Check if user already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingPhone = await User.findOne({ where: { phone_number } });
    if (existingPhone) {
      throw new Error('Phone number already registered');
    }

    // Create new user
    const user = await User.create({
      full_name,
      email,
      phone_number,
      password_hash: password,
      role: 'passenger',
    });
    return { user: user.toJSON() };
  }

  static async loginUser(email: string, password: string) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return { user: user.toJSON(), token };
  }

  static async logoutUser(token: string, userId: number) {
    // Decode token to get expiration
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklist.addToken(token, userId, expiresAt);

    return { message: 'Logged out successfully' };
  }

  static async getUserProfile(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.toJSON();
  }

  static async updateUserProfile(
    userId: number,
    updateData: {
      full_name?: string;
      email?: string;
      phone_number?: string;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(updateData);
    return user.toJSON();
  }

  private static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
  }
}
