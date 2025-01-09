const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Không cần thêm các tùy chọn deprecated
    console.log("Kết nối MongoDB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);
    process.exit(1); // Thoát nếu kết nối thất bại
  }
};

module.exports = connectDB;