const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// 修改为你的实际数据库配置
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: '123', 
  database: 'Green_Space_DB'    
});

// 测试数据库连接
connection.connect((err) => {
  if (err) {
    console.error(' 数据库连接失败:', err.message);  // 打印具体错误
    return;
  }
  console.log(' 成功连接到数据库');
});

//  首页路由（用于测试服务器是否正常）
app.get('/', (req, res) => {
  res.send(' 服务器正在运行，欢迎访问 Green Space Plant API');
});

// 获取某绿地的植物列表，按名称排序
app.get('/plants/:space_id', (req, res) => {
  const spaceId = req.params.space_id;
  const query = `
    SELECT p.plant_id, p.plant_name, p.plant_description, p.plant_watering, p.plant_sunlight, p.plant_pruning
    FROM plants_info p
    JOIN space_plant sp ON p.plant_id = sp.plant_id
    WHERE sp.space_id = ?
    ORDER BY p.plant_name ASC
  `;
  connection.query(query, [spaceId], (err, results) => {
    if (err) {
      console.error(' 获取植物列表出错:', err);
      res.status(500).send('服务器内部错误');
    } else {
      res.json(results);
    }
  });
});

// 获取植物详情
// app.get('/plant/:plant_id', (req, res) => {
//   const plantId = req.params.plant_id;
//   const query = `
//     SELECT * FROM plants_info WHERE plant_id = ?
//   `;
//   connection.query(query, [plantId], (err, results) => {
//     if (err) {
//       console.error(' 获取植物详情出错:', err);
//       res.status(500).send('服务器内部错误');
//     } else if (results.length === 0) {
//       res.status(404).send('未找到该植物');
//     } else {
//       res.json(results[0]);
//     }
//   });
// });

// 获取植物详情，并显示能在其他绿地找到该植物的绿地
app.get('/plant/:plant_id', (req, res) => {
  const plantId = req.params.plant_id;

  // 查询植物详情
  const plantDetailsQuery = `
    SELECT * FROM plants_info WHERE plant_id = ?
  `;

  // 查询其他绿地包含此植物的记录
  const spacesWithPlantQuery = `
    SELECT DISTINCT sp.space_id
    FROM space_plant sp
    WHERE sp.plant_id = ? AND sp.space_id != ?
  `;

  connection.query(plantDetailsQuery, [plantId], (err, plantDetails) => {
    if (err) {
      console.error(' 获取植物详情出错:', err);
      res.status(500).send('服务器内部错误');
    } else if (plantDetails.length === 0) {
      res.status(404).send('未找到该植物');
    } else {
      connection.query(spacesWithPlantQuery, [plantId, plantId], (err, otherSpaces) => {
        if (err) {
          console.error(' 获取其他绿地信息出错:', err);
          res.status(500).send('服务器内部错误');
        } else {
          // 返回植物详情以及其他绿地信息
          res.json({
            plantDetails: plantDetails[0],
            otherSpaces: otherSpaces
          });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});