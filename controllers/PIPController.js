const PIP = require("../models/PIPModel");

// Create new PIP
exports.createPIP = async (req, res) => {
  try {
    const { employee, employeeId, dateIssued, reason, targets, comments } = req.body;
    
    // Validate required fields
    if (!employee || !dateIssued) {
      return res.status(400).json({ 
        success: false,
        error: "Employee and Date Issued are required fields" 
      });
    }

    const pipData = {
      employee,
      employeeId: employeeId || "",
      dateIssued,
      reason: reason || "",
      targets: targets || "",
      comments: comments || ""
    };

    const newPIP = await PIP.create(pipData);
    
    res.status(201).json({
      success: true,
      message: "PIP created successfully",
      data: newPIP
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all PIPs with optional filters
exports.getAllPIPs = async (req, res) => {
  try {
    const { employeeId, employee, startDate, endDate } = req.query;
    
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (employee) query.employee = { $regex: employee, $options: 'i' };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.dateIssued = {};
      if (startDate) query.dateIssued.$gte = new Date(startDate);
      if (endDate) query.dateIssued.$lte = new Date(endDate);
    }
    
    const pips = await PIP.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pips.length,
      data: pips
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single PIP by ID
exports.getPIPById = async (req, res) => {
  try {
    const pip = await PIP.findById(req.params.id);
    
    if (!pip) {
      return res.status(404).json({ 
        success: false,
        error: "PIP not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: pip
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get PIPs by employee ID
exports.getPIPsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required"
      });
    }
    
    const pips = await PIP.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pips.length,
      data: pips
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get PIPs by employee name
exports.getPIPsByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    
    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee name is required"
      });
    }
    
    const pips = await PIP.find({ 
      employee: { $regex: employee, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pips.length,
      data: pips
    });
  } catch (error) {
    console.error("Fetch by employee error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update PIP
exports.updatePIP = async (req, res) => {
  try {
    const { employee, employeeId, dateIssued, reason, targets, comments } = req.body;
    
    // Check if PIP exists
    const existingPIP = await PIP.findById(req.params.id);
    if (!existingPIP) {
      return res.status(404).json({ 
        success: false,
        error: "PIP not found" 
      });
    }

    const updateData = {
      employee: employee || existingPIP.employee,
      employeeId: employeeId !== undefined ? employeeId : existingPIP.employeeId,
      dateIssued: dateIssued || existingPIP.dateIssued,
      reason: reason !== undefined ? reason : existingPIP.reason,
      targets: targets !== undefined ? targets : existingPIP.targets,
      comments: comments !== undefined ? comments : existingPIP.comments
    };

    const updatedPIP = await PIP.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "PIP updated successfully",
      data: updatedPIP
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete PIP
exports.deletePIP = async (req, res) => {
  try {
    const pip = await PIP.findById(req.params.id);
    
    if (!pip) {
      return res.status(404).json({ 
        success: false,
        error: "PIP not found" 
      });
    }

    await PIP.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "PIP deleted successfully"
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
exports.bulkImportPIPs = async (req, res) => {
  try {
    const pipsData = req.body;
    
    if (!Array.isArray(pipsData) || pipsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedPIPs = [];
    
    for (const p of pipsData) {
      // Validate each PIP
      if (!p.employee || !p.dateIssued) {
        console.warn("Skipping PIP with missing required fields:", p);
        continue;
      }

      const pipData = {
        employee: p.employee.toString(),
        employeeId: p.employeeId?.toString() || "",
        dateIssued: p.dateIssued.toString(),
        reason: p.reason?.toString() || "",
        targets: p.targets?.toString() || "",
        comments: p.comments?.toString() || ""
      };

      const newPIP = await PIP.create(pipData);
      importedPIPs.push(newPIP);
    }

    res.status(201).json({
      success: true,
      message: `${importedPIPs.length} PIPs imported successfully`,
      data: importedPIPs
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};