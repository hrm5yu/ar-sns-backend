export const addMock = jest.fn();

export const FieldValue = {
    serverTimestamp: jest.fn().mockReturnValue('mocked-timestamp'),
};

export const admin = {
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'mockUserId' }),
  }),
  storage: () => ({
    bucket: () => ({
      file: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue(undefined),
        getSignedUrl: jest.fn().mockResolvedValue(['https://mock.url/file.jpg']),
      }),
    }),
  }),
  firestore: () => ({
    FieldValue,
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
        update: jest.fn(),
      }),
      add: addMock,
      get: jest.fn().mockResolvedValue([]),
    }),
  }),
};

export const bucket = admin.storage().bucket();
export const db = admin.firestore();
