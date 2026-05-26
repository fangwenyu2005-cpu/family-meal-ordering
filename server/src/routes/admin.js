const express = require('express');
const jwt = require('jsonwebtoken');
const { jwtSecret, adminUsername, adminPassword } = require('../config');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ error: '账号或密码错误' });
  }
  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' });
  res.json({ token });
});

// --- 订单管理 ---

// GET /api/admin/orders
router.get('/orders', authRequired, async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const orders = await req.prisma.order.findMany({
      where,
      include: {
        table: true,
        items: {
          include: {
            product: true,
            specs: { include: { specOption: { include: { group: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', authRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['SUBMITTED', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '无效状态' });
    }
    const order = await req.prisma.order.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// --- 菜单管理 ---

// POST /api/admin/products
router.post('/products', authRequired, async (req, res, next) => {
  try {
    const { categoryId, name, description, imageUrl, basePrice, sortOrder, specGroupIds } = req.body;
    const product = await req.prisma.product.create({
      data: {
        categoryId,
        name,
        description,
        imageUrl,
        basePrice,
        sortOrder: sortOrder || 0,
        specs: specGroupIds ? {
          create: specGroupIds.map(sgId => ({ specGroupId: sgId })),
        } : undefined,
      },
      include: {
        category: true,
        specs: { include: { specGroup: { include: { options: true } } } },
      },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', authRequired, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, imageUrl, basePrice, isAvailable, sortOrder, specGroupIds } = req.body;

    if (specGroupIds !== undefined) {
      await req.prisma.productSpec.deleteMany({ where: { productId: id } });
      if (specGroupIds.length > 0) {
        await req.prisma.productSpec.createMany({
          data: specGroupIds.map(sgId => ({ productId: id, specGroupId: sgId })),
        });
      }
    }

    const product = await req.prisma.product.update({
      where: { id },
      data: { name, description, imageUrl, basePrice, isAvailable, sortOrder },
      include: {
        category: true,
        specs: { include: { specGroup: { include: { options: true } } } },
      },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', authRequired, async (req, res, next) => {
  try {
    await req.prisma.product.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- 桌号管理 ---

// POST /api/admin/tables
router.post('/tables', authRequired, async (req, res, next) => {
  try {
    const { tableNumber } = req.body;
    const table = await req.prisma.table.create({
      data: { tableNumber, qrCodeUrl: `/qrcode/${tableNumber}` },
    });
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/tables
router.get('/tables', authRequired, async (req, res, next) => {
  try {
    const tables = await req.prisma.table.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tables);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
