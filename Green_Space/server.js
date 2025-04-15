// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 引入模块化路由（标准 express.Router）
const plantRoutes = require('./routes/plants');
const spaceRoutes = require('./routes/spaces');

app.use(cors());

// 首页测试
app.get('/', (req, res) => {
  res.send('🌿 服务器正在运行，欢迎访问 Green Space Plant API');
});

// ✅ 正确加载 router 模块路径前缀
app.use('/spaces', spaceRoutes);
app.use('/plants', plantRoutes);
// app.use('/', spaceRoutes);
// app.use('/', plantRoutes);

// 启动服务
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
