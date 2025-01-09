const mongoose = require("mongoose");

const parentExpenseSchema = new mongoose.Schema(
  {
    ngayBatDau: { type: Date, default: Date.now }, // Lấy ngày hiện tại làm mặc định
    ngayKetThuc: { type: Date, default: null }, // Có thể để null
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParentExpense", parentExpenseSchema);