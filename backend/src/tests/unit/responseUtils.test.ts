import { sendSuccess, sendError, sendCreated } from '../../utils/responseUtils';

describe('responseUtils', () => {
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn();
  const res: any = { status: mockStatus, json: mockJson };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendSuccess sends message, data, and status 200 by default', () => {
    sendSuccess(res, { a: 1 }, 'ok');
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ message: 'ok', data: { a: 1 } });
  });

  it('sendError sends error and details with provided status', () => {
    sendError(res, 'bad', 422, [{ field: 'email' }]);
    expect(mockStatus).toHaveBeenCalledWith(422);
    expect(mockJson).toHaveBeenCalledWith({ error: 'bad', details: [{ field: 'email' }] });
  });

  it('sendCreated delegates to sendSuccess with 201', () => {
    sendCreated(res, { id: 7 }, 'created');
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({ message: 'created', data: { id: 7 } });
  });
});

