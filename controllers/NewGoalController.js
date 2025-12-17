const NewGoal = require("../models/NewGoalModel");

// Create new goal
exports.createNewGoal = async (req, res) => {
  try {
    const { goal, progress, isGroup, status, employee, employeeId, company, description } = req.body;
    
    // Validate required fields
    if (!goal || !employee) {
      return res.status(400).json({ 
        success: false,
        error: "Goal and Employee are required fields" 
      });
    }

    const goalData = {
      goal,
      progress: progress || "",
      isGroup: isGroup || false,
      status: status || "Pending",
      employee,
      employeeId: employeeId || "",
      company: company || "Shrirang Automation and Controls",
      description: description || ""
    };

    const newGoal = await NewGoal.create(goalData);
    
    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: newGoal
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all goals with optional filters
exports.getAllNewGoals = async (req, res) => {
  try {
    const { employeeId, employee, status, company } = req.query;
    
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (employee) query.employee = { $regex: employee, $options: 'i' };
    if (status) query.status = status;
    if (company) query.company = { $regex: company, $options: 'i' };
    
    const goals = await NewGoal.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single goal by ID
exports.getNewGoalById = async (req, res) => {
  try {
    const goal = await NewGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ 
        success: false,
        error: "Goal not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get goals by employee ID
exports.getGoalsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required"
      });
    }
    
    const goals = await NewGoal.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get goals by employee name
exports.getGoalsByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    
    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee name is required"
      });
    }
    
    const goals = await NewGoal.find({ 
      employee: { $regex: employee, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error("Fetch by employee error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get goals by status
exports.getGoalsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required"
      });
    }
    
    const goals = await NewGoal.find({ status }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error("Fetch by status error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update goal
exports.updateNewGoal = async (req, res) => {
  try {
    const { goal, progress, isGroup, status, employee, employeeId, company, description } = req.body;
    
    // Check if goal exists
    const existingGoal = await NewGoal.findById(req.params.id);
    if (!existingGoal) {
      return res.status(404).json({ 
        success: false,
        error: "Goal not found" 
      });
    }

    const updateData = {
      goal: goal || existingGoal.goal,
      progress: progress !== undefined ? progress : existingGoal.progress,
      isGroup: isGroup !== undefined ? isGroup : existingGoal.isGroup,
      status: status || existingGoal.status,
      employee: employee || existingGoal.employee,
      employeeId: employeeId !== undefined ? employeeId : existingGoal.employeeId,
      company: company !== undefined ? company : existingGoal.company,
      description: description !== undefined ? description : existingGoal.description
    };

    const updatedGoal = await NewGoal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: updatedGoal
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete goal
exports.deleteNewGoal = async (req, res) => {
  try {
    const goal = await NewGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ 
        success: false,
        error: "Goal not found" 
      });
    }

    await NewGoal.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Goal deleted successfully"
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
exports.bulkImportNewGoals = async (req, res) => {
  try {
    const goalsData = req.body;
    
    if (!Array.isArray(goalsData) || goalsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedGoals = [];
    
    for (const g of goalsData) {
      // Validate each goal
      if (!g.goal || !g.employee) {
        console.warn("Skipping goal with missing required fields:", g);
        continue;
      }

      const goalData = {
        goal: g.goal.toString(),
        progress: g.progress?.toString() || "",
        isGroup: g.isGroup === "Yes" || g.isGroup === "yes" || g.isGroup === true || g.isGroup === "TRUE",
        status: g.status?.toString() || "Pending",
        employee: g.employee.toString(),
        employeeId: g.employeeId?.toString() || "",
        company: g.company?.toString() || "Shrirang Automation and Controls",
        description: g.description?.toString() || ""
      };

      const newGoal = await NewGoal.create(goalData);
      importedGoals.push(newGoal);
    }

    res.status(201).json({
      success: true,
      message: `${importedGoals.length} goals imported successfully`,
      data: importedGoals
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};