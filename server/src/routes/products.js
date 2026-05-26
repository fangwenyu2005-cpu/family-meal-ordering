const express = require('express');
const router = express.Router();

// GET /api/products?category=1
router.get('/', async (req, res, next) => {
  try {
    const where = { isAvailable: true };
    if (req.query.category) {
      where.categoryId = parseInt(req.query.category, 10);
    }
    const products = await req.prisma.product.findMany({
      where,
      include: {
        category: true,
        specs: {
          include: {
            specGroup: {
              include: { options: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        category: true,
        specs: {
          include: {
            specGroup: {
              include: { options: true },
            },
          },
        },
      },
    });
    if (!product) return res.status(404).json({ error: '商品不存在' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
