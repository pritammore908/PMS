const EmployeeOnboarding = require("../models/EmployeeOnboardingModel");

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { 
      fullName, 
      employeeId,
      workEmail, 
      hireDate, 
      department, 
      reportingManager,
      addedOn 
    } = req.body;
    
    // Validate required fields
    if (!fullName || !workEmail) {
      return res.status(400).json({ 
        success: false,
        error: "Full Name and Work Email are required fields" 
      });
    }

    const employeeData = {
      fullName,
      employeeId: employeeId || "",
      workEmail,
      hireDate: hireDate || "",
      department: department || "",
      reportingManager: reportingManager || "",
      addedOn: addedOn || Date.now()
    };

    const newEmployee = await EmployeeOnboarding.create(employeeData);
    
    res.status(201).json({
      success: true,
      message: "Employee onboarding completed successfully",
      data: newEmployee
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { employeeId, fullName } = req.query;
    
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    
    const employees = await EmployeeOnboarding.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeOnboarding.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get employees by employee ID
exports.getEmployeeByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employees = await EmployeeOnboarding.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get employees by name
exports.getEmployeesByName = async (req, res) => {
  try {
    const { fullName } = req.params;
    
    const employees = await EmployeeOnboarding.find({ 
      fullName: { $regex: fullName, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Fetch by name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { 
      fullName, 
      employeeId,
      workEmail, 
      hireDate, 
      department, 
      reportingManager,
      addedOn 
    } = req.body;
    
    // Check if employee exists
    const existingEmployee = await EmployeeOnboarding.findById(req.params.id);
    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee not found" 
      });
    }

    const updateData = {
      fullName: fullName || existingEmployee.fullName,
      employeeId: employeeId !== undefined ? employeeId : existingEmployee.employeeId,
      workEmail: workEmail || existingEmployee.workEmail,
      hireDate: hireDate !== undefined ? hireDate : existingEmployee.hireDate,
      department: department !== undefined ? department : existingEmployee.department,
      reportingManager: reportingManager !== undefined ? reportingManager : existingEmployee.reportingManager,
      addedOn: addedOn !== undefined ? addedOn : existingEmployee.addedOn
    };

    const updatedEmployee = await EmployeeOnboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await EmployeeOnboarding.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee not found" 
      });
    }

    await EmployeeOnboarding.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
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
exports.bulkImportEmployees = async (req, res) => {
  try {
    const employeesData = req.body;
    
    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedEmployees = [];
    
    for (const emp of employeesData) {
      // Validate required fields
      if (!emp.fullName || !emp.workEmail) {
        console.warn("Skipping employee with missing required fields:", emp);
        continue;
      }

      const employeeData = {
        fullName: emp.fullName.toString(),
        employeeId: emp.employeeId?.toString() || "",
        workEmail: emp.workEmail.toString(),
        hireDate: emp.hireDate || "",
        department: emp.department?.toString() || "",
        reportingManager: emp.reportingManager?.toString() || "",
        addedOn: emp.addedOn || Date.now()
      };

      const newEmployee = await EmployeeOnboarding.create(employeeData);
      importedEmployees.push(newEmployee);
    }

    res.status(201).json({
      success: true,
      message: `${importedEmployees.length} employees imported successfully`,
      data: importedEmployees
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};