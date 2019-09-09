const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 8081;
const CDN_URL = process.env.CDN_URL || `https://localhost:${PORT}`;
const authMiddleware = require('./server/middleware/auth')
const userRoutes = require('./server/routes/user.routes');
const signatureRoutes = require('./server/routes/signature.routes');
const cardRoutes = require('./server/routes/card.routes');
const signatureOpenRoutes = require('./server/routes/signatureOpen.routes');
const authRoutes = require('./server/routes/auth.routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv/config');
const MONGO_URL=process.env.MONGODB_URI || 'mongodb://db/assinaturas'
//'mongodb://db/assinaturas'
const server = express();
mongoose.connect(MONGO_URL, {useNewUrlParser: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

server.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH,DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept, Authorization')
  next();
})

server.use(authRoutes);
server.use(signatureOpenRoutes);
server.use(authMiddleware);
server.use(userRoutes);
server.use(signatureRoutes);
server.use(cardRoutes);
//server.use(app);








server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/ CDN:${CDN_URL}`));