const EmployeeDetails = require("../models/EmployeeDetailsModel");

// Helper function to format date for display
const formatDisplayFromInput = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return iso.replace("T", " ");
    }
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yy} ${hh}:${mi}:${ss}`;
  } catch (err) {
    return iso;
  }
};

// Create new employee details
exports.createEmployeeDetails = async (req, res) => {
  try {
    const { employee, reviewer, addedOnInput, company, rating, employeeId } = req.body;
    
    // Validate required fields
    if (!employee || !reviewer) {
      return res.status(400).json({ 
        error: "Employee and Reviewer are required fields" 
      });
    }

    // Prepare data
    const addedOn = addedOnInput ? formatDisplayFromInput(addedOnInput) : 
      formatDisplayFromInput(new Date().toISOString().slice(0, 16));
    
    const employeeData = {
      employee,
      reviewer,
      addedOnInput: addedOnInput || new Date().toISOString().slice(0, 16),
      addedOn,
      company: company || "Shrirang Automation and Controls",
      rating: rating || "",
      employeeId: employeeId || ""
    };

    const newEmployee = await EmployeeDetails.create(employeeData);
    
    res.status(201).json({
      success: true,
      message: "Employee details created successfully",
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

// Get all employee details
exports.getAllEmployeeDetails = async (req, res) => {
  try {
    const employees = await EmployeeDetails.find().sort({ createdAt: -1 });
    
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

// Get single employee details by ID
exports.getEmployeeDetailsById = async (req, res) => {
  try {
    const employee = await EmployeeDetails.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee details not found" 
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

// Get employee details by employee ID
exports.getEmployeeDetailsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employees = await EmployeeDetails.find({ employeeId }).sort({ createdAt: -1 });
    
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

// Get employee details by employee name
exports.getEmployeeDetailsByEmployeeName = async (req, res) => {
  try {
    const { employeeName } = req.params;
    
    const employees = await EmployeeDetails.find({ 
      employee: { $regex: employeeName, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Fetch by employee name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update employee details
exports.updateEmployeeDetails = async (req, res) => {
  try {
    const { employee, reviewer, addedOnInput, company, rating, employeeId } = req.body;
    
    // Check if employee exists
    const existingEmployee = await EmployeeDetails.findById(req.params.id);
    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee details not found" 
      });
    }

    // Prepare update data
    const updateData = {
      employee: employee || existingEmployee.employee,
      reviewer: reviewer || existingEmployee.reviewer,
      company: company || existingEmployee.company,
      rating: rating !== undefined ? rating : existingEmployee.rating,
      employeeId: employeeId !== undefined ? employeeId : existingEmployee.employeeId
    };

    // Handle date update
    if (addedOnInput) {
      updateData.addedOnInput = addedOnInput;
      updateData.addedOn = formatDisplayFromInput(addedOnInput);
    }

    const updatedEmployee = await EmployeeDetails.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Employee details updated successfully",
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

// Delete employee details
exports.deleteEmployeeDetails = async (req, res) => {
  try {
    const employee = await EmployeeDetails.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: "Employee details not found" 
      });
    }

    await EmployeeDetails.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Employee details deleted successfully"
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
      const addedOn = emp.addedOnInput ? 
        formatDisplayFromInput(emp.addedOnInput) : 
        formatDisplayFromInput(new Date().toISOString().slice(0, 16));
      
      const employeeData = {
        employee: emp.employee || "",
        reviewer: emp.reviewer || "",
        addedOnInput: emp.addedOnInput || new Date().toISOString().slice(0, 16),
        addedOn,
        company: emp.company || "Shrirang Automation and Controls",
        rating: emp.rating || "",
        employeeId: emp.employeeId || ""
      };

      const newEmployee = await EmployeeDetails.create(employeeData);
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
exports.getEmployeeDetailsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employees = await EmployeeDetails.find({ employeeId }).sort({ createdAt: -1 });
    
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

// Get employee details by employee name
exports.getEmployeeDetailsByEmployeeName = async (req, res) => {
  try {
    const { employeeName } = req.params;
    
    const employees = await EmployeeDetails.find({ 
      employee: { $regex: employeeName, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Fetch by employee name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};