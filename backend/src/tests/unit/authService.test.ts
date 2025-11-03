import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/authService';

jest.mock('../../models/User', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
  };
});

jest.mock('../../models/TokenBlacklist', () => {
  return {
    __esModule: true,
    default: {
      addToken: jest.fn(),
      isBlacklisted: jest.fn(),
    },
  };
});

// Use require to avoid top-level await issues in ts-jest
const User: any = require('../../models/User').default;
const TokenBlacklist: any = require('../../models/TokenBlacklist').default;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('throws if email already exists', async () => {
      User.findOne.mockResolvedValueOnce({ id: 1 });
      await expect(
        AuthService.registerUser({ full_name: 'A', email: 'a@a.com', phone_number: '123', password: 'Password1' })
      ).rejects.toThrow('Email already registered');
    });

    it('creates user when unique', async () => {
      User.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // phone check
      const created = {
        toJSON: () => ({ id: 2, email: 'a@a.com' }),
      };
      User.create.mockResolvedValueOnce(created);

      const result = await AuthService.registerUser({
        full_name: 'A',
        email: 'a@a.com',
        phone_number: '123',
        password: 'Password1',
      });

      expect(User.create).toHaveBeenCalled();
      expect(result).toEqual({ user: { id: 2, email: 'a@a.com' } });
    });
  });

  describe('loginUser', () => {
    it('throws on missing user', async () => {
      User.findOne.mockResolvedValueOnce(null);
      await expect(AuthService.loginUser('x@x.com', 'pw')).rejects.toThrow('Invalid email or password');
    });

    it('returns token on valid login', async () => {
      const user = {
        id: 5,
        email: 'x@x.com',
        role: 'user',
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 5, email: 'x@x.com', role: 'user' }),
      };
      User.findOne.mockResolvedValueOnce(user);
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('token-abc' as any);

      const result = await AuthService.loginUser('x@x.com', 'pw');
      expect(signSpy).toHaveBeenCalled();
      expect(result).toEqual({ user: { id: 5, email: 'x@x.com', role: 'user' }, token: 'token-abc' });
    });
  });

  describe('logoutUser', () => {
    it('adds token to blacklist', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      jest.spyOn(jwt, 'decode').mockReturnValue({ exp } as any);
      TokenBlacklist.addToken.mockResolvedValueOnce({});

      await expect(AuthService.logoutUser('tok', 1)).resolves.toEqual({ message: 'Logged out successfully' });
      expect(TokenBlacklist.addToken).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('throws if not found', async () => {
      User.findByPk.mockResolvedValueOnce(null);
      await expect(AuthService.getUserProfile(1)).rejects.toThrow('User not found');
    });
  });
});

