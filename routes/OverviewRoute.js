const express = require("express");
const router = express.Router();

const {
  createOverview,
  getOverview,
  updateOverview,
  deleteOverview,
} = require("../controllers/OverviewController");

// CRUD
router.post("/", createOverview);
router.get("/", getOverview);
router.put("/:id", updateOverview);
router.delete("/:id", deleteOverview);

module.exports = router;
