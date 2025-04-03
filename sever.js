require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 连接 MySQL 数据库
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 获取所有绿地（按地区 & A-Z 排序）
app.get('/parks', async (req, res) => {
    try {
        const [parks] = await db.query("SELECT * FROM parks ORDER BY region, name");
        res.json(parks);
    } catch (err) {
        res.status(500).json({ error: "数据库错误" });
    }
});

// 获取特定绿地详细信息
app.get('/parks/:id', async (req, res) => {
    try {
        const [park] = await db.query("SELECT * FROM parks WHERE id = ?", [req.params.id]);
        if (park.length === 0) return res.status(404).json({ error: "绿地未找到" });
        res.json(park[0]);
    } catch (err) {
        res.status(500).json({ error: "数据库错误" });
    }
});

// 获取特定绿地的植物列表
app.get('/parks/:id/plants', async (req, res) => {
    try {
        const [plants] = await db.query("SELECT * FROM plants WHERE park_id = ? ORDER BY name", [req.params.id]);
        res.json(plants);
    } catch (err) {
        res.status(500).json({ error: "数据库错误" });
    }
});

// 获取特定植物的详细信息
app.get('/plants/:id', async (req, res) => {
    try {
        const [plant] = await db.query("SELECT * FROM plants WHERE id = ?", [req.params.id]);
        if (plant.length === 0) return res.status(404).json({ error: "植物未找到" });
        res.json(plant[0]);
    } catch (err) {
        res.status(500).json({ error: "数据库错误" });
    }
});

// 启动服务器
app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'));
