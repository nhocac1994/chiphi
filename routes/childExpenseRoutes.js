// routes/childExpenseRoutes.js

const express = require("express");
const mongoose = require('mongoose');
const ChildExpense = require("../models/ChildExpense"); // Import model ChildExpense
const { addChildExpense, getChildExpenses, getChildExpensesByParentId, updateChildExpense, deleteChildExpense } = require("../controllers/childExpenseController");
const router = express.Router();

// Route để thêm chi phí (bảng con)
router.post("/", addChildExpense);

// Route để lấy chi phí theo mã bảng cha - Định nghĩa trước để tránh xung đột
router.get("/parent/:parentId", getChildExpensesByParentId);

// Route để lấy tất cả chi phí (bảng con)
router.get("/", getChildExpenses);

// Route GET /:id - Lấy chi phí con theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  try {
    console.log("ID nhận được:", id);

    const childExpense = await ChildExpense.findById(id).populate("maChiPhi", "ngayBatDau ngayKetThuc");
    if (!childExpense) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu." });
    }

    console.log("Dữ liệu trả về:", childExpense);
    res.status(200).json(childExpense);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error.message);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu.", error: error.message });
  }
});

// Route PUT /:id - Cập nhật chi phí con theo ID
router.put("/:id", updateChildExpense);

// Route DELETE /:id - Xóa chi phí con theo ID
router.delete("/:id", deleteChildExpense);

module.exports = router;
