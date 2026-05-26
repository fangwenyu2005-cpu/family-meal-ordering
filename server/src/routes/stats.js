const express = require('express');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// GET /api/stats/overview
router.get('/overview', authRequired, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue, totalOrders] = await Promise.all([
      req.prisma.order.count({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
      }),
      req.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { totalPrice: true },
      }),
      req.prisma.order.count({
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    res.json({
      todayOrders,
      todayRevenue: todayRevenue._sum.totalPrice || 0,
      totalOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/ranking
router.get('/ranking', authRequired, async (req, res, next) => {
  try {
    const ranking = await req.prisma.$queryRaw`
      SELECT p.id, p.name, c.name as category_name, SUM(oi.quantity)::int as total_qty,
             SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
      GROUP BY p.id, p.name, c.name
      ORDER BY total_qty DESC
      LIMIT 20
    `;
    res.json(ranking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
