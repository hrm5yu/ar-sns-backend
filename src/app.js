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
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// エラーハンドリング用ミドルウェア
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// 投稿を作成するエンドポイント
app.post('/posts', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, text, userId } = req.body;
    if (!latitude || !longitude || !text || !userId) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newPost = {
        createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        latitude,
        longitude,
        text,
        userId
    };
    const docRef = yield firebase_1.db.collection('posts').add(newPost);
    res.status(201).json(Object.assign({ id: docRef.id }, newPost));
})));
// スポットを作成するエンドポイント
app.post('/spots', asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, latitude, longitude, tags, isActive, description } = req.body;
    if (!name || !latitude || !longitude || !tags || !isActive || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newSpot = {
        createdAt: firebase_1.admin.firestore.FieldValue.serverTimestamp(),
        name,
        latitude,
        longitude,
        tags,
        isActive,
        description
    };
    const docRef = yield firebase_1.db.collection('spots').add(newSpot);
    res.status(201).json(Object.assign({ id: docRef.id }, newSpot));
})));
// スポット一覧取得
app.get('/spots', asyncHandler((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield firebase_1.db.collection('spots').get();
    const spots = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    res.status(200).json(spots);
})));
// エラー処理ミドルウェア（最後に配置）
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
// サーバー起動
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
