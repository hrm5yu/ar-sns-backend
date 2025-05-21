import request from 'supertest';
import { addMock } from '../utils/__mocks__/firebase';
import { createApp } from '../createApp';
import { Request, Response, NextFunction } from 'express';

jest.mock('../utils/firebase');

jest.mock('../middlewares/authenticate');

const validBody = {
  latitude: 35.6895,
  longitude: 139.6917,
  text: 'こんにちは！',
};

describe('POST /posts - createPost handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a post with valid data', async () => {
    addMock.mockResolvedValue({ id: 'mockPostId' });

    const app = await createApp();
    const res = await request(app).post('/posts').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('text', 'こんにちは！');
  });

  it('should fail with invalid latitude (string)', async () => {
    const app = await createApp();
    const res = await request(app).post('/posts').send({
      ...validBody,
      latitude: 'invalid',
    });
    expect(res.status).toBe(400);
  });

  it('should fail with empty text', async () => {
    const app = await createApp();
    const res = await request(app).post('/posts').send({
      ...validBody,
      text: '',
    });
    expect(res.status).toBe(400);
  });

  it('should fail if user is not authenticated', async () => {
    jest.resetModules();
    jest.unmock('../middlewares/authenticate');
    const { createApp } = require('../createApp');
    const app = await createApp();
    const res = await request(app)
      .post('/posts')
      .send(validBody);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', '認証トークンがありません');
  });
});
