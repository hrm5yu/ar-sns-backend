import request from 'supertest';
import path from 'path';
import { admin } from '../utils/firebase';
import { createApp } from '../createApp';

jest.mock('../utils/firebase');
jest.mock('../middlewares/authenticate', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { uid: 'test-user-id' };
    next();
  },
}));

const validBody = {
  text: '画像付き投稿テスト',
  latitude: 35.6895,
  longitude: 139.6917,
};

describe('POST /posts-image', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    const { bucket } = require('../utils/firebase');
    bucket.name = 'mock-bucket';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
   afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should upload image and create a post', async () => {
    const fileMock = {
      createWriteStream: jest.fn(() => {
        const stream = require('stream').PassThrough();
        process.nextTick(() => stream.emit('finish'));
        return stream;
      }),
      makePublic: jest.fn().mockResolvedValue([{}])
    };
    (admin.storage().bucket().file as jest.Mock).mockReturnValue(fileMock);

    const app = await createApp();
    const res = await request(app)
      .post('/posts-image')
      .field('text', validBody.text)
      .field('latitude', validBody.latitude)
      .field('longitude', validBody.longitude)
      .attach('file', path.join(__dirname, 'fixtures/sample.jpg'));

    expect(res.status).toBe(201);
    expect(res.body.imageUrl).toMatch(/^https:\/\/storage\.googleapis\.com\/mock-bucket\/\d+_sample\.jpg$/);
  });

  it('should reject non-image file', async () => {
    const app = await createApp();
    const res = await request(app)
      .post('/posts-image')
      .field('text', validBody.text)
      .field('latitude', validBody.latitude)
      .field('longitude', validBody.longitude)
      .attach('file', path.join(__dirname, 'fixtures/not-an-image.txt'));

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Only image files are allowed');
  });

  it('should work without image', async () => {
    const app = await createApp();
    const res = await request(app)
      .post('/posts-image')
      .field('text', validBody.text)
      .field('latitude', validBody.latitude)
      .field('longitude', validBody.longitude);

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('imageUrl');
  });
});
