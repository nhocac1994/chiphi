// controllers/childExpenseController.js

const mongoose = require("mongoose");
const ChildExpense = require("../models/ChildExpense");
const ParentExpense = require("../models/ParentExpense");

// Thêm chi phí (bảng con)
// controllers/childExpenseController.js

const addChildExpense = async (req, res) => {
  try {
    const { maChiPhi, ngayThang, noiDung, giaTien, diaDiem, ghiChu } = req.body;

    // Thêm dòng log để kiểm tra dữ liệu nhận được
    console.log("Dữ liệu nhận được từ frontend:", req.body);

    // Kiểm tra dữ liệu đầu vào
    if (!maChiPhi || !ngayThang || !noiDung || giaTien == null || !diaDiem) {
      let missingFields = [];
      if (!maChiPhi) missingFields.push("maChiPhi");
      if (!ngayThang) missingFields.push("ngayThang");
      if (!noiDung) missingFields.push("noiDung");
      if (giaTien == null) missingFields.push("giaTien");
      if (!diaDiem) missingFields.push("diaDiem");

      return res.status(400).json({ message: `Vui lòng điền đầy đủ thông tin chi phí. Các trường thiếu: ${missingFields.join(", ")}` });
    }

    // Kiểm tra bảng cha
    const parentExpense = await ParentExpense.findById(maChiPhi);
    if (!parentExpense) {
      return res.status(404).json({ message: "Không tìm thấy bảng cha với ID này." });
    }

    // Tạo bảng con
    const newChildExpense = new ChildExpense({
      maChiPhi,
      ngayThang,
      noiDung,
      giaTien,
      diaDiem,
      ghiChu,
      hinhAnh: null, // Ban đầu chưa có hình ảnh
    });

    const savedExpense = await newChildExpense.save();

    // Cập nhật ngày kết thúc của bảng cha nếu cần
    if (!parentExpense.ngayKetThuc || new Date(ngayThang) > new Date(parentExpense.ngayKetThuc)) {
      parentExpense.ngayKetThuc = ngayThang;
      await parentExpense.save();
    }

    res.status(201).json(savedExpense); // Trả về dữ liệu ngay sau khi lưu
  } catch (error) {
    console.error("Lỗi khi thêm bảng con:", error.message);
    res.status(500).json({ message: "Lỗi khi thêm bảng con.", error: error.message });
  }
};


// Lấy danh sách chi phí (bảng con)
const getChildExpenses = async (req, res) => {
  try {
    const expenses = await ChildExpense.find().populate("maChiPhi", "ngayBatDau ngayKetThuc");
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chi phí:", error.message);
    res.status(500).json({ message: "Lỗi khi lấy danh sách chi phí.", error: error.message });
  }
};

// Lấy danh sách chi phí theo mã bảng cha
const getChildExpensesByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Kiểm tra parentId
    if (!parentId) {
      return res.status(400).json({ message: "Vui lòng cung cấp mã bảng cha." });
    }

    // Kiểm tra parentId là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "Parent ID không hợp lệ." });
    }

    const expenses = await ChildExpense.find({ maChiPhi: parentId }).populate("maChiPhi", "ngayBatDau ngayKetThuc");
    res.status(200).json(expenses); // Luôn trả về mảng
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chi phí theo mã bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi lấy danh sách chi phí.", error: error.message });
  }
};

// Cập nhật chi phí con theo ID
const updateChildExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { ngayThang, noiDung, giaTien, diaDiem, ghiChu } = req.body;

    console.log("Cập nhật chi phí với ID:", id);
    console.log("Dữ liệu gửi lên:", req.body);

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!ngayThang || !noiDung || giaTien == null || !diaDiem) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin chi phí." });
    }

    if (isNaN(giaTien) || giaTien <= 0) {
      return res.status(400).json({ message: "Giá tiền phải là một số lớn hơn 0." });
    }

    // Tìm và cập nhật chi phí con
    const updatedExpense = await ChildExpense.findByIdAndUpdate(
      id,
      { ngayThang, noiDung, giaTien, diaDiem, ghiChu },
      { new: true }
    ).populate("maChiPhi", "ngayBatDau ngayKetThuc");

    if (!updatedExpense) {
      return res.status(404).json({ message: "Không tìm thấy chi phí con với ID này." });
    }

    // Cập nhật ngày kết thúc của bảng cha nếu cần
    const parentExpense = await ParentExpense.findById(updatedExpense.maChiPhi);
    if (parentExpense && (!parentExpense.ngayKetThuc || new Date(ngayThang) > new Date(parentExpense.ngayKetThuc))) {
      parentExpense.ngayKetThuc = ngayThang;
      await parentExpense.save();
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Lỗi khi cập nhật chi phí con:", error.message);
    res.status(500).json({ message: "Lỗi khi cập nhật chi phí con.", error: error.message });
  }
};

// Xóa chi phí con theo ID
const deleteChildExpense = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID nhận được để xoá:", id);

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ID không hợp lệ.");
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    // Tìm và xoá chi phí con
    const deletedExpense = await ChildExpense.findByIdAndDelete(id);

    if (!deletedExpense) {
      console.log("Không tìm thấy chi phí con để xoá với ID này.");
      return res.status(404).json({ message: "Không tìm thấy chi phí con với ID này." });
    }

    console.log("Chi phí con đã được xoá:", deletedExpense);
    res.status(200).json({ message: "Xoá chi phí con thành công." });
  } catch (error) {
    console.error("Lỗi khi xoá chi phí con:", error.message);
    res.status(500).json({ message: "Lỗi khi xoá chi phí con.", error: error.message });
  }
};

module.exports = {
  addChildExpense,
  getChildExpenses,
  getChildExpensesByParentId,
  updateChildExpense,
  deleteChildExpense,
};
