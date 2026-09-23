const jwt = require('jsonwebtoken');

function requireUser(req, res, next) {
  const bearer = (req.headers.authorization || '').replace('Bearer ', '');
  if (!bearer) return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  try {
    const payload = jwt.verify(bearer, process.env.JWT_SECRET);
    if (!payload.userId) throw new Error('not a user token');
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sessiya yaroqsiz — qaytadan kiring' });
  }
}

module.exports = requireUser;
