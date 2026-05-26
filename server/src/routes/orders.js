const express = require('express');
const router = express.Router();

// POST /api/orders — 提交订单
router.post('/', async (req, res, next) => {
  try {
    const { tableId, dineType, items } = req.body;

    const order = await req.prisma.$transaction(async (tx) => {
      // 逐项计算价格
      const orderItemsData = [];
      let totalPrice = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw Object.assign(new Error(`商品不存在`), { status: 400 });
        }

        let itemPrice = Number(product.basePrice);
        if (item.specOptionIds && item.specOptionIds.length > 0) {
          const specOptions = await tx.specOption.findMany({
            where: { id: { in: item.specOptionIds } },
          });
          for (const opt of specOptions) {
            itemPrice += Number(opt.priceDelta);
          }
        }

        totalPrice += itemPrice * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: itemPrice,
          specOptionIds: item.specOptionIds || [],
        });
      }

      // 创建订单及明细
      const newOrder = await tx.order.create({
        data: {
          tableId,
          dineType: dineType || 'EAT_IN',
          totalPrice,
          items: {
            create: orderItemsData.map((oi) => ({
              productId: oi.productId,
              quantity: oi.quantity,
              price: oi.price,
              specs: {
                create: oi.specOptionIds.map((specId) => ({
                  specOptionId: specId,
                })),
              },
            })),
          },
        },
        include: {
          table: true,
          items: {
            include: {
              product: true,
              specs: { include: { specOption: { include: { group: true } } } },
            },
          },
        },
      });
      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — 查询订单
router.get('/:id', async (req, res, next) => {
  try {
    const order = await req.prisma.order.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        table: true,
        items: {
          include: {
            product: true,
            specs: { include: { specOption: { include: { group: true } } } },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ error: '订单不存在' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/cancel — 取消订单
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const order = await req.prisma.order.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });
    if (!order) return res.status(404).json({ error: '订单不存在' });
    if (order.status !== 'SUBMITTED') {
      return res.status(400).json({ error: '只能取消已提交的订单' });
    }
    const updated = await req.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
