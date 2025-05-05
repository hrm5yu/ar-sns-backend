import request from 'supertest';

describe('POST /posts - createPost handler', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const setupApp = async (authMock: any) => {
    // 認証モック
    jest.mock('../middlewares/authenticate', () => ({
      authenticate: authMock,
    }));

    // Firebaseモック
    jest.mock('../utils/firebase', () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'mockPostId' });
      return {
        admin: {
          firestore: Object.assign(() => ({
            collection: () => ({
              add: mockAdd,
            }),
          }), {
            FieldValue: {
              serverTimestamp: jest.fn().mockReturnValue('mocked-timestamp'),
            },
          }),
        },
      };
    });

    const { createApp } = require('../createApp');
    return createApp();
  };

  const validBody = {
    latitude: 35.6895,
    longitude: 139.6917,
    text: 'こんにちは！',
  };

  it('should create a post with valid data', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('text', 'こんにちは！');
  });

  it('should fail with invalid latitude (string)', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      latitude: 'not a number',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with invalid longitude (string)', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      longitude: 'not a number',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with out-of-range latitude', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      latitude: -100,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with out-of-range longitude', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      longitude: -181,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with empty text', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      text: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with text longer than 200 characters', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      ...validBody,
      text: 'あ'.repeat(201),
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail with invalid text, latitude and longitude', async () => {
    const app = await setupApp((req: any, _res: any, next: any) => {
      req.user = { uid: 'test-user-id' };
      next();
    });

    const res = await request(app).post('/posts').send({
      latitude: 'not a number',
      longitude: 200,
      text: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request body');
  });

  it('should fail if user is not authenticated', async () => {
    const app = await setupApp((_req: any, _res: any, next: any) => {
      // req.user を与えない → 認証失敗とみなされる
      next();
    });

    const res = await request(app).post('/posts').send(validBody);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });
});
