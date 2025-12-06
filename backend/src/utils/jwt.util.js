 const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(user) {
  const payload = { sub: user._id, role: user.role };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return token;
}

module.exports = { signToken };
