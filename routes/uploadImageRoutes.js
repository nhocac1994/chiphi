const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const ChildExpense = require("../models/ChildExpense");

const router = express.Router();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Tên Cloudinary từ dashboard
  api_key: process.env.CLOUDINARY_API_KEY, // API Key từ dashboard
  api_secret: process.env.CLOUDINARY_API_SECRET, // API Secret từ dashboard
});

// Cấu hình lưu trữ với Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Thư mục trên Cloudinary
    format: async (req, file) => "webp", // Định dạng ảnh nén
    public_id: (req, file) => `optimized-${Date.now()}-${file.originalname.split('.')[0]}`, // Tên tệp
    transformation: [{ width: 800, crop: "limit" }], // Resize ảnh
  },
});

const upload = multer({ storage });

// Route để tải lên hình ảnh
router.post("/", upload.single("image"), async (req, res) => {
    try {
      const { childId } = req.body;
      const file = req.file;
  
      if (!childId || !file) {
        return res.status(400).json({ message: "Thiếu childId hoặc hình ảnh." });
      }
  
      // Tải hình ảnh lên Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "child_expenses",
      });
  
      // Cập nhật đường dẫn hình ảnh trong cơ sở dữ liệu
      const childExpense = await ChildExpense.findById(childId);
      if (!childExpense) {
        return res.status(404).json({ message: "Không tìm thấy chi phí con với ID này." });
      }
  
      childExpense.hinhAnh = result.secure_url;
      await childExpense.save();
  
      res.status(200).json({ message: "Hình ảnh đã được tải lên thành công.", hinhAnh: result.secure_url });
    } catch (error) {
      console.error("Lỗi khi tải lên hình ảnh:", error.message);
      res.status(500).json({ message: "Lỗi khi tải lên hình ảnh.", error: error.message });
    }
  });

module.exports = router;
