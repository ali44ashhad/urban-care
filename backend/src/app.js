// require('express-async-errors');
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');
// const routes = require('./routes');
// const { errorHandler } = require('./middlewares/error.middleware');
// const mongoose = require('mongoose');

// const app = express();

// app.use(helmet());
// app.use(cors());
// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
 
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
 
// app.use('/api/v1', routes);

// app.get('/health', (req, res) => {
//   // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//   const dbState = mongoose.connection.readyState;
//   res.json({ ok: true, dbState });
// });
// // health
// // app.get('/health', (req, res) => res.json({ ok: true }));

// // error handler
// app.use(errorHandler);

// module.exports = app;


require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');   // 🔹 new
const config = require('./config');            // 🔹 new
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// 🔹 DB connect on app load (production + local both me chalega)
(async () => {
  try {
    await connectDB(config.mongoUri);
    console.log('MongoDB connected from app.js');
  } catch (err) {
    console.error('Failed to connect MongoDB from app.js', err);
  }
})();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// mount routes
app.use('/api/v1', routes);

// health
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0/1/2/3
  res.json({ ok: true, dbState });
});

// error handler
app.use(errorHandler);

module.exports = app;
