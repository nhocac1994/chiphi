// controllers/parentExpenseController.js

const mongoose = require("mongoose");
const ParentExpense = require("../models/ParentExpense");
const ChildExpense = require("../models/ChildExpense");

// API Controllers

// Thêm mới bảng cha
const addParentExpense = async (req, res) => {
  try {
    const { ngayBatDau, ngayKetThuc } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!ngayBatDau) {
      return res.status(400).json({ message: "Ngày bắt đầu là bắt buộc." });
    }

    const newParentExpense = new ParentExpense({
      ngayBatDau,
      ngayKetThuc,
      // Thêm các trường khác nếu cần
    });

    const savedParent = await newParentExpense.save();
    res.status(201).json(savedParent);
  } catch (error) {
    console.error("Lỗi khi thêm bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi thêm bảng cha.", error: error.message });
  }
};

// Lấy danh sách bảng cha
const getParentExpenses = async (req, res) => {
  try {
    const parents = await ParentExpense.find();
    res.status(200).json(parents);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi lấy danh sách bảng cha.", error: error.message });
  }
};

// Lấy thông tin bảng cha theo ID (API)
const getParentExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const parent = await ParentExpense.findById(id);
    if (!parent) {
      return res.status(404).json({ message: "Không tìm thấy bảng cha." });
    }

    res.json(parent);
  } catch (error) {
    console.error("Lỗi khi lấy bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi lấy bảng cha.", error: error.message });
  }
};

// Cập nhật bảng cha theo ID (API)
const updateParentExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { ngayBatDau, ngayKetThuc } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const updatedParent = await ParentExpense.findByIdAndUpdate(
      id,
      { ngayBatDau, ngayKetThuc },
      { new: true }
    );

    if (!updatedParent) {
      return res.status(404).json({ message: "Không tìm thấy bảng cha với ID này." });
    }

    res.status(200).json(updatedParent);
  } catch (error) {
    console.error("Lỗi khi cập nhật bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi cập nhật bảng cha.", error: error.message });
  }
};

// Xóa bảng cha theo ID (API)
const deleteParentExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const parentExpense = await ParentExpense.findById(id);
    if (!parentExpense) {
      return res.status(404).json({ message: "Không tìm thấy bảng cha với ID này." });
    }

    // Xóa tất cả chi phí con liên quan nếu cần
    await ChildExpense.deleteMany({ maChiPhi: id });

    // Xóa bảng cha
    await ParentExpense.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa bảng cha thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa bảng cha:", error.message);
    res.status(500).json({ message: "Lỗi khi xóa bảng cha.", error: error.message });
  }
};

// View Controllers

// Hàm controller cho view read-only
const getReadOnlyParentWithChildren = async (req, res) => {
  try {
    const parentId = req.params.id;
    console.log('🚀 Truy cập route /view/:id với ID:', parentId);

    // Kiểm tra tính hợp lệ của ObjectId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      console.log('❌ ID không hợp lệ.');
      return res.status(400).send('ID bảng cha không hợp lệ.');
    }

    // Tìm bảng cha
    const parent = await ParentExpense.findById(parentId);
    if (!parent) {
      console.log('❌ Không tìm thấy bảng cha với ID này.');
      return res.status(404).send('Không tìm thấy bảng cha với ID này.');
    }
    console.log('✅ Tìm thấy bảng cha:', parent);

    // Tìm các bảng con liên quan
    const children = await ChildExpense.find({ maChiPhi: parentId });
    console.log(`✅ Tìm thấy ${children.length} chi phí con.`);

    // Xác định baseUrl
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Render view read-only
    res.render('parentReadOnlyView', { parent, children, baseUrl });
  } catch (error) {
    console.error('❌ Lỗi khi lấy bảng cha và bảng con:', error);
    res.status(500).send('Đã xảy ra lỗi trên server.');
  }
};

// Hàm controller cho view chỉnh sửa (Edit View)
const getParentWithChildren = async (req, res) => {
  try {
    const parentId = req.params.id;
    console.log('🚀 Truy cập route /edit/:id với ID:', parentId);

    // Kiểm tra tính hợp lệ của ObjectId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      console.log('❌ ID không hợp lệ.');
      return res.status(400).send('ID bảng cha không hợp lệ.');
    }

    // Tìm bảng cha
    const parent = await ParentExpense.findById(parentId);
    if (!parent) {
      console.log('❌ Không tìm thấy bảng cha với ID này.');
      return res.status(404).send('Không tìm thấy bảng cha với ID này.');
    }
    console.log('✅ Tìm thấy bảng cha:', parent);

    // Tìm các bảng con liên quan
    const children = await ChildExpense.find({ maChiPhi: parentId });
    console.log(`✅ Tìm thấy ${children.length} chi phí con.`);

    // Render view chỉnh sửa
    res.render('parentView', { parent, children });
  } catch (error) {
    console.error('❌ Lỗi khi lấy bảng cha và bảng con:', error);
    res.status(500).send('Đã xảy ra lỗi trên server.');
  }
};

module.exports = {
  addParentExpense,
  getParentExpenses,
  getParentExpenseById,
  updateParentExpense,
  deleteParentExpense,
  getReadOnlyParentWithChildren,
  getParentWithChildren,
};
