require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const OverviewRoute = require("./routes/OverviewRoute");
const KRAsRoute = require("./routes/KRARoute");
const FeedbackRoute = require("./routes/FeedbackRoute");
const EmployeeDetailsRoute = require("./routes/EmployeeDetailsRoute");
const Feedback1Route = require("./routes/Feedback1Route");
const NewGoalRoute = require("./routes/NewGoalRoute");
const EmployeePromotionRoute = require("./routes/EmployeePromotionRoute");
const PIPRoute = require("./routes/PIPRoute");
const AnnualReportRoute = require("./routes/AnnualReportRoute");
const EmployeeOnboardingRoute = require("./routes/EmployeeOnboardingRoute");
const UserViewRoute = require("./routes/UserViewRoute");
const SelfAppraisalRoute = require("./routes/SelfAppraisalRoute");
const authRoutes = require("./routes/authRoutes");
const EmployeeResignationRoute = require("./routes/EmployeeResignationRoute");
const employeeRoutes = require('./routes/EmployeeSideRoute');
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// Routes
app.use("/api/overview", OverviewRoute);
app.use("/api/kra", KRAsRoute);
app.use("/api/feedback", FeedbackRoute);
app.use("/api/employee-details", EmployeeDetailsRoute);
app.use("/api/feedback1", Feedback1Route);
app.use("/api/new-goals", NewGoalRoute);
app.use("/api/employee-promotions", EmployeePromotionRoute);
app.use("/api/pips", PIPRoute);
app.use("/api/annual-reports", AnnualReportRoute);
app.use("/api/employee-onboarding", EmployeeOnboardingRoute);
app.use("/api/user-views", UserViewRoute);
app.use("/api/self-appraisals", SelfAppraisalRoute);
app.use("/api/auth", authRoutes);
app.use("/api/employee-resignation", EmployeeResignationRoute);    
app.use('/api', employeeRoutes);                               

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    routes: [
      "/api/overview",
      "/api/kra",
      "/api/feedback",
      "/api/employee-details",
      "/api/feedback1",
      "/api/new-goals",
      "/api/employee-promotions",
      "/api/employee/:employeeId/goals",
      "/api/employee/:employeeId/performance",
      "/api/employee/:employeeId/dashboard/stats"
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔️ Server running on port ${PORT}`);
  console.log(`📁 Available routes:`);
  console.log(`   - http://localhost:${PORT}/api/overview`);
  console.log(`   - http://localhost:${PORT}/api/kra`);
  console.log(`   - http://localhost:${PORT}/api/feedback`);
  console.log(`   - http://localhost:${PORT}/api/employee-details`);
  console.log(`   - http://localhost:${PORT}/api/feedback1`);
  console.log(`   - http://localhost:${PORT}/api/new-goals`);
  console.log(`   - http://localhost:${PORT}/api/employee-promotions`);
  console.log(`   - http://localhost:${PORT}/api/pips`);
  console.log(`   - http://localhost:${PORT}/api/employee/:employeeId/goals`);
  console.log(`   - http://localhost:${PORT}/api/employee/:employeeId/performance`);
  console.log(`   - http://localhost:${PORT}/api/employee/:employeeId/dashboard/stats`);
  console.log(`   - http://localhost:${PORT}/api/health (health check)`);
});