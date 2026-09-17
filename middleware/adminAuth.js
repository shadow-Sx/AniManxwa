const jwt = require('jsonwebtoken');

// This is the real fix for the prototype's weak point: the admin codes now
// live only in server environment variables and are checked server-side.
// The browser only ever sees a signed, time-limited token — never the codes.
function requireAdmin(req, res, next) {
  const bearer = (req.headers.authorization || '').replace('Bearer ', '');
  const token = req.cookies?.adminToken || bearer;
  if (!token) return res.status(401).json({ error: 'Admin huquqi kerak' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isAdmin) throw new Error('not admin');
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Admin tokeni yaroqsiz yoki muddati tugagan' });
  }
}

module.exports = requireAdmin;
