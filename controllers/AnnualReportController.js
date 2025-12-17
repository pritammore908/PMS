const AnnualReport = require("../models/AnnualReportModel");

// Create new annual report
exports.createAnnualReport = async (req, res) => {
  try {
    const { 
      employeeName, 
      jobTitle, 
      department, 
      reviewPeriod, 
      managerName, 
      dateOfReview,
      achievements,
      developmentGoals,
      performanceRating,
      managerComments,
      competencies,
      employeeId
    } = req.body;
    
    // Validate required fields
    if (!employeeName || !managerName) {
      return res.status(400).json({ 
        success: false,
        error: "Employee Name and Manager Name are required fields" 
      });
    }

    const reportData = {
      employeeName,
      jobTitle: jobTitle || "",
      department: department || "",
      reviewPeriod: reviewPeriod || "Jan 1, 2024 - Dec 31, 2024",
      managerName,
      dateOfReview: dateOfReview || "",
      achievements: achievements || "",
      developmentGoals: developmentGoals || "",
      performanceRating: performanceRating || "",
      managerComments: managerComments || "",
      competencies: competencies || [],
      employeeId: employeeId || ""
    };

    const newReport = await AnnualReport.create(reportData);
    
    res.status(201).json({
      success: true,
      message: "Annual report created successfully",
      data: newReport
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all annual reports
exports.getAllAnnualReports = async (req, res) => {
  try {
    const { employeeId, employeeName } = req.query;
    
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (employeeName) query.employeeName = { $regex: employeeName, $options: 'i' };
    
    const reports = await AnnualReport.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single report by ID
exports.getAnnualReportById = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false,
        error: "Annual report not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get reports by employee ID
exports.getAnnualReportsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const reports = await AnnualReport.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get reports by employee name
exports.getAnnualReportsByEmployeeName = async (req, res) => {
  try {
    const { employeeName } = req.params;
    
    const reports = await AnnualReport.find({ 
      employeeName: { $regex: employeeName, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Fetch by employee name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update annual report
exports.updateAnnualReport = async (req, res) => {
  try {
    const { 
      employeeName, 
      jobTitle, 
      department, 
      reviewPeriod, 
      managerName, 
      dateOfReview,
      achievements,
      developmentGoals,
      performanceRating,
      managerComments,
      competencies,
      employeeId
    } = req.body;
    
    // Check if report exists
    const existingReport = await AnnualReport.findById(req.params.id);
    if (!existingReport) {
      return res.status(404).json({ 
        success: false,
        error: "Annual report not found" 
      });
    }

    const updateData = {
      employeeName: employeeName || existingReport.employeeName,
      jobTitle: jobTitle !== undefined ? jobTitle : existingReport.jobTitle,
      department: department !== undefined ? department : existingReport.department,
      reviewPeriod: reviewPeriod !== undefined ? reviewPeriod : existingReport.reviewPeriod,
      managerName: managerName || existingReport.managerName,
      dateOfReview: dateOfReview !== undefined ? dateOfReview : existingReport.dateOfReview,
      achievements: achievements !== undefined ? achievements : existingReport.achievements,
      developmentGoals: developmentGoals !== undefined ? developmentGoals : existingReport.developmentGoals,
      performanceRating: performanceRating !== undefined ? performanceRating : existingReport.performanceRating,
      managerComments: managerComments !== undefined ? managerComments : existingReport.managerComments,
      competencies: competencies !== undefined ? competencies : existingReport.competencies,
      employeeId: employeeId !== undefined ? employeeId : existingReport.employeeId
    };

    const updatedReport = await AnnualReport.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Annual report updated successfully",
      data: updatedReport
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete annual report
exports.deleteAnnualReport = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false,
        error: "Annual report not found" 
      });
    }

    await AnnualReport.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Annual report deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Bulk import from Excel
exports.bulkImportAnnualReports = async (req, res) => {
  try {
    const reportsData = req.body;
    
    if (!Array.isArray(reportsData) || reportsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedReports = [];
    
    for (const r of reportsData) {
      // Validate required fields
      if (!r.employeeName || !r.managerName) {
        console.warn("Skipping report with missing required fields:", r);
        continue;
      }

      const reportData = {
        employeeName: r.employeeName.toString(),
        jobTitle: r.jobTitle?.toString() || "",
        department: r.department?.toString() || "",
        reviewPeriod: r.reviewPeriod?.toString() || "Jan 1, 2024 - Dec 31, 2024",
        managerName: r.managerName.toString(),
        dateOfReview: r.dateOfReview?.toString() || "",
        achievements: r.achievements?.toString() || "",
        developmentGoals: r.developmentGoals?.toString() || "",
        performanceRating: r.performanceRating?.toString() || "",
        managerComments: r.managerComments?.toString() || "",
        competencies: r.competencies || [],
        employeeId: r.employeeId?.toString() || ""
      };

      const newReport = await AnnualReport.create(reportData);
      importedReports.push(newReport);
    }

    res.status(201).json({
      success: true,
      message: `${importedReports.length} annual reports imported successfully`,
      data: importedReports
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};