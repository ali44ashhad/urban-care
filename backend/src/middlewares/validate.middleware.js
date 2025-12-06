 // src/middlewares/validate.middleware.js
/**
 * Usage:
 * router.post('/route', validate(['field1','field2']), controller)
 *
 * Optionally pass an object with `{ body: ['a'], params: ['id'], query: ['q'] }`
 */
function validate(spec) {
  // normalize to object form
  let rules = spec;
  if (Array.isArray(spec)) rules = { body: spec };

  return (req, res, next) => {
    const missing = [];

    for (const zone of ['body', 'params', 'query']) {
      if (!rules[zone]) continue;
      const keys = rules[zone];
      for (const k of keys) {
        if (req[zone] == null || typeof req[zone][k] === 'undefined' || req[zone][k] === null || req[zone][k] === '') {
          missing.push(`${zone}.${k}`);
        }
      }
    }

    if (missing.length) {
      return res.status(400).json({ message: 'Missing required fields', missing });
    }
    next();
  };
}

module.exports = { validate };
