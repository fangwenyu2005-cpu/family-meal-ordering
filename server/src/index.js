const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { port } = require('./config');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 注入 prisma 到请求上下文
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// 公开路由
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
