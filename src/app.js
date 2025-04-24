"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_1 = require("./firebase");
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// アップロード保存先ディレクトリ
const uploadDir = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
// Multerの設定
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
// エラーハンドリング用ミドルウェア
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// 画像投稿用エンドポイント
app.post('/posts-image', upload.single('image'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    const imageUrl = `/uploads/${file.filename}`;
    const { latitude, longitude, text, userId } = req.body;
    if (!latitude || !longitude || !text || !userId) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    const newPost = {
        createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        text,
        userId,
        imageUrl,
    };
    const docRef = yield firebase_1.db.collection('posts').add(newPost);
    res.status(201).json(Object.assign({ id: docRef.id }, newPost));
})));
// 静的ファイル提供（画像を参照できるように）
app.use('/uploads', express_1.default.static(uploadDir));
// テキスト投稿エンドポイント
app.post('/posts', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, text, userId } = req.body;
    if (!latitude || !longitude || !text || !userId) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    const newPost = {
        createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        text,
        userId,
    };
    const docRef = yield firebase_1.db.collection('posts').add(newPost);
    res.status(201).json(Object.assign({ id: docRef.id }, newPost));
})));
// スポット作成エンドポイント
app.post('/spots', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, latitude, longitude, tags, isActive, description } = req.body;
    if (!name || latitude == null || longitude == null || !tags || isActive == null || !description) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    const newSpot = {
        createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        tags,
        isActive,
        description,
    };
    const docRef = yield firebase_1.db.collection('spots').add(newSpot);
    res.status(201).json(Object.assign({ id: docRef.id }, newSpot));
})));
// スポット一覧取得エンドポイント
app.get('/spots', asyncHandler((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection('spots').get();
    const spots = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    res.status(200).json(spots);
})));
// エラー処理ミドルウェア
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
// サーバー起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
