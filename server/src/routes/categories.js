const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await req.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
