import { authenticate, authorizeAdmin } from '../../middleware/auth';
import jwt from 'jsonwebtoken';

jest.mock('../../models/TokenBlacklist', () => ({
  __esModule: true,
  default: {
    isBlacklisted: jest.fn(),
  },
}));

const TokenBlacklist: any = require('../../models/TokenBlacklist').default;

describe('auth middleware', () => {
  const next = jest.fn();
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when no token provided', async () => {
    const req: any = { headers: {} };
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects when token blacklisted', async () => {
    const req: any = { headers: { authorization: 'Bearer t' } };
    TokenBlacklist.isBlacklisted.mockResolvedValueOnce(true);
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user when token valid', async () => {
    const req: any = { headers: { authorization: 'Bearer t' } };
    TokenBlacklist.isBlacklisted.mockResolvedValueOnce(false);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 9, email: 'e', role: 'user' } as any);

    await authenticate(req, res, next);
    expect(req.user).toEqual({ id: 9, email: 'e', role: 'user' });
    expect(next).toHaveBeenCalled();
  });

  it('authorizeAdmin blocks non-admins', () => {
    const req: any = { user: { id: 1, role: 'user' } };
    authorizeAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

