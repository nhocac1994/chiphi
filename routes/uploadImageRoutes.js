// routes/uploadImageRoutes.js

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp"); // Sử dụng Sharp để tối ưu hóa hình ảnh
const ChildExpense = require("../models/ChildExpense");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Cấu hình lưu trữ với multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Đảm bảo thư mục 'uploads/' tồn tại
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Route để tải lên hình ảnh
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const { childId } = req.body;
    const file = req.file;

    if (!childId || !file) {
      // Nếu có file đã upload nhưng không cần, hãy xóa file đó
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Thiếu childId hoặc hình ảnh." });
    }

    // Kiểm tra childId là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(childId)) {
      // Xóa file đã upload nếu childId không hợp lệ
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "childId không hợp lệ." });
    }

    // Tìm chi phí con
    const childExpense = await ChildExpense.findById(childId);
    if (!childExpense) {
      // Xóa file đã upload nếu không tìm thấy chi phí con
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: "Không tìm thấy chi phí con với ID này." });
    }

    // Nếu chi phí con đã có hình ảnh, xoá hình ảnh cũ
    if (childExpense.hinhAnh) {
      const oldImagePath = path.join(__dirname, "../", childExpense.hinhAnh);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`Đã xoá hình ảnh cũ: ${oldImagePath}`);
      }
    }

    // Xử lý ảnh với Sharp
    const optimizedImagePath = `uploads/optimized-${Date.now()}-${path.parse(file.originalname).name}.webp`;

    await sharp(file.path)
      .resize({ width: 800 }) // Resize ảnh nếu cần
      .webp({ quality: 60 }) // Nén ảnh
      .toFile(optimizedImagePath);

    fs.unlinkSync(file.path); // Xóa tệp gốc sau khi xử lý

    // Cập nhật đường dẫn hình ảnh trong database
    childExpense.hinhAnh = `/${optimizedImagePath}`;
    await childExpense.save();

    res.status(200).json({ message: "Hình ảnh đã được tải lên thành công.", hinhAnh: childExpense.hinhAnh });
  } catch (error) {
    console.error("Lỗi khi tải lên hình ảnh:", error.message);
    res.status(500).json({ message: "Lỗi khi tải lên hình ảnh.", error: error.message });
  }
});

module.exports = router;
