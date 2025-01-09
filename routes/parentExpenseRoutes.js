// routes/parentExpenseRoutes.js

const express = require("express");
const { 
  addParentExpense, 
  getParentExpenses, 
  getParentExpenseById, 
  updateParentExpense, 
  deleteParentExpense 
} = require("../controllers/parentExpenseController");
const router = express.Router();

// Thêm mới bảng cha
router.post("/", addParentExpense);

// Lấy danh sách bảng cha
router.get("/", getParentExpenses);

// Lấy thông tin bảng cha theo ID (API)
router.get("/:id", getParentExpenseById);

// Cập nhật bảng cha theo ID
router.put("/:id", updateParentExpense);

// Xóa bảng cha theo ID
router.delete("/:id", deleteParentExpense);

module.exports = router;
