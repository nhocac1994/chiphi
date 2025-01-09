// api/index.js

const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Các Route của bạn
// Ví dụ:
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Xin chào từ Express.js trên Vercel!' });
});

// Nếu bạn đã cấu hình các route khác, hãy thêm chúng vào đây
// Ví dụ:
// app.use('/api/parent-expenses', parentExpenseRoutes);
// app.use('/api/child-expenses', childExpenseRoutes);
// ...

module.exports = app;
module.exports.handler = serverless(app);
