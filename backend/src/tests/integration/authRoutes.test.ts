import request from 'supertest';
import app from '../../app';

jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const User: any = require('../../models/User').default;

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('validates body and creates user', async () => {
      User.findOne
        .mockResolvedValueOnce(null) // email
        .mockResolvedValueOnce(null); // phone
      User.create.mockResolvedValueOnce({
        toJSON: () => ({ id: 10, email: 'a@a.com' }),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Alice',
          email: 'a@a.com',
          phone_number: '123456',
          password: 'Password1',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user).toMatchObject({ id: 10, email: 'a@a.com' });
    });

    it('returns 400 on already registered email', async () => {
      User.findOne.mockResolvedValueOnce({ id: 1 });
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Alice',
          email: 'a@a.com',
          phone_number: '123456',
          password: 'Password1',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('fails validation when body missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com' });
      expect(res.status).toBe(400);
    });
  });
});

