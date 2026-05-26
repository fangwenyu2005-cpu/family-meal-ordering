const express = require('express');
const router = express.Router();

router.get('/:code', async (req, res, next) => {
  try {
    const table = await req.prisma.table.findUnique({
      where: { tableNumber: req.params.code },
    });
    if (!table || !table.isActive) {
      return res.status(404).json({ error: '桌号无效' });
    }
    res.json({ id: table.id, tableNumber: table.tableNumber });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
