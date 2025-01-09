// routes/viewRoutes.js

const express = require("express");
const router = express.Router();
const { getReadOnlyParentWithChildren, getParentWithChildren } = require("../controllers/parentExpenseController");

// Route GET /view/:id để hiển thị read-only view
router.get("/view/:id", getReadOnlyParentWithChildren);

// Route GET /edit/:id để hiển thị edit view (nếu cần)
router.get("/edit/:id", getParentWithChildren);

module.exports = router;

