// app.js

require("dotenv").config(); // Đảm bảo dòng này được đặt ở trên cùng

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose"); // Đảm bảo bạn đã cài đặt mongoose
const connectDB = require("./config/db");
const parentExpenseRoutes = require("./routes/parentExpenseRoutes");
const childExpenseRoutes = require("./routes/childExpenseRoutes");
const uploadImageRoutes = require("./routes/uploadImageRoutes");
const viewRoutes = require("./routes/viewRoutes");
const serverless = require("serverless-http");

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware để parse JSON body
app.use(express.json());

// Middleware để parse URL-encoded data (nếu cần)
app.use(express.urlencoded({ extended: true }));

// Middleware để hỗ trợ method override
app.use(methodOverride('_method')); // Sử dụng tham số '_method' để thay thế phương thức

// Đảm bảo thư mục public được phục vụ
app.use(express.static(path.join(__dirname, "public")));

// Thiết lập view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount các route API
app.use("/api/parent-expenses", parentExpenseRoutes);
app.use("/api/child-expenses", childExpenseRoutes);
app.use("/api/upload-image", uploadImageRoutes);

// Mount các route view
app.use("/", viewRoutes); // Đảm bảo rằng viewRoutes đã được nhập khẩu



// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error("Lỗi toàn cục:", err.stack);
  res.status(500).json({ message: "Internal server error." });
});

// Xuất Express app cho Vercel
module.exports = app;
module.exports.handler = serverless(app);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
