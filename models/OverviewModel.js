const mongoose = require("mongoose");

const OverviewSchema = new mongoose.Schema({
  series: String,
  employee: String,
  employeeId: String,  // Add this line
  company: String,
  appraisalCycle: String,
});

module.exports = mongoose.model("Overview", OverviewSchema);