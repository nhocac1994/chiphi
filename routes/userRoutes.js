const express = require("express");
const router = express.Router();

// Lấy danh sách người dùng
router.get("/", (req, res) => {
  res.json({ message: "Danh sách người dùng" });
});

// Tạo người dùng mới
router.post("/", (req, res) => {
  const { name } = req.body;
  res.json({ message: `Người dùng mới: ${name}` });
});

module.exports = router;