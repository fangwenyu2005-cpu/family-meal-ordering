const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    req.user = jwt.verify(header.slice(7), jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期' });
  }
}

module.exports = { authRequired };
