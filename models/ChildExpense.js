const mongoose = require("mongoose");

const childExpenseSchema = new mongoose.Schema(
  {
    maChiPhi: { type: mongoose.Schema.Types.ObjectId, ref: "ParentExpense", required: true }, // Liên kết tới bảng cha
    ngayThang: { type: Date, required: true },
    noiDung: { type: String, required: true },
    giaTien: { type: Number, required: true },
    diaDiem: { type: String, required: true },
    ghiChu: { type: String },
    hinhAnh: { type: String }, // Lưu URL hình ảnh
  },
  { timestamps: true } // Thêm ngày tạo và cập nhật tự động
);

module.exports = mongoose.model("ChildExpense", childExpenseSchema);