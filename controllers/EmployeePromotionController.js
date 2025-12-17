const EmployeePromotion = require("../models/EmployeePromotionModel");

// Create new promotion (single record)
exports.createEmployeePromotion = async (req, res) => {
  try {
    const { name, date, currency, company, justification, property, current, newValue, employeeId } = req.body;
    
    // Validate required fields
    if (!name || !date || !property || !newValue) {
      return res.status(400).json({ 
        success: false,
        error: "Employee name, date, property and new value are required fields" 
      });
    }

    const promotionData = {
      name,
      date,
      currency: currency || "INR",
      company: company || "Shrirang Automation",
      justification: justification || "",
      property,
      current: current || "",
      newValue,
      employeeId: employeeId || ""
    };

    const newPromotion = await EmployeePromotion.create(promotionData);
    
    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: newPromotion
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Bulk create promotions (multiple records)
exports.createBulkPromotions = async (req, res) => {
  try {
    const promotionsData = req.body;
    
    if (!Array.isArray(promotionsData) || promotionsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedPromotions = [];
    
    for (const promo of promotionsData) {
      // Validate each promotion
      if (!promo.name || !promo.date || !promo.property || !promo.newValue) {
        console.warn("Skipping promotion with missing required fields:", promo);
        continue;
      }

      const promotionData = {
        name: promo.name.toString(),
        date: promo.date.toString(),
        currency: promo.currency?.toString() || "INR",
        company: promo.company?.toString() || "Shrirang Automation",
        justification: promo.justification?.toString() || "",
        property: promo.property.toString(),
        current: promo.current?.toString() || "",
        newValue: promo.newValue.toString(),
        employeeId: promo.employeeId?.toString() || ""
      };

      const newPromotion = await EmployeePromotion.create(promotionData);
      importedPromotions.push(newPromotion);
    }

    res.status(201).json({
      success: true,
      message: `${importedPromotions.length} promotions created successfully`,
      data: importedPromotions
    });
  } catch (error) {
    console.error("Bulk create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all promotions
exports.getAllEmployeePromotions = async (req, res) => {
  try {
    const { employeeId, name } = req.query;
    
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (name) query.name = { $regex: name, $options: 'i' };
    
    const promotions = await EmployeePromotion.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single promotion by ID
exports.getEmployeePromotionById = async (req, res) => {
  try {
    const promotion = await EmployeePromotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        error: "Promotion not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get promotions by employee ID
exports.getPromotionsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const promotions = await EmployeePromotion.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get promotions by employee name
exports.getPromotionsByEmployeeName = async (req, res) => {
  try {
    const { name } = req.params;
    
    const promotions = await EmployeePromotion.find({ 
      name: { $regex: name, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error("Fetch by employee name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update promotion
exports.updateEmployeePromotion = async (req, res) => {
  try {
    const { name, date, currency, company, justification, property, current, newValue, employeeId } = req.body;
    
    // Check if promotion exists
    const existingPromotion = await EmployeePromotion.findById(req.params.id);
    if (!existingPromotion) {
      return res.status(404).json({ 
        success: false,
        error: "Promotion not found" 
      });
    }

    const updateData = {
      name: name || existingPromotion.name,
      date: date || existingPromotion.date,
      currency: currency !== undefined ? currency : existingPromotion.currency,
      company: company !== undefined ? company : existingPromotion.company,
      justification: justification !== undefined ? justification : existingPromotion.justification,
      property: property || existingPromotion.property,
      current: current !== undefined ? current : existingPromotion.current,
      newValue: newValue || existingPromotion.newValue,
      employeeId: employeeId !== undefined ? employeeId : existingPromotion.employeeId
    };

    const updatedPromotion = await EmployeePromotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      data: updatedPromotion
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete promotion
exports.deleteEmployeePromotion = async (req, res) => {
  try {
    const promotion = await EmployeePromotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ 
        success: false,
        error: "Promotion not found" 
      });
    }

    await EmployeePromotion.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Import from Excel (special format - employee details + multiple properties)
exports.importFromExcel = async (req, res) => {
  try {
    const { employeeData, promotionRows } = req.body;
    
    if (!employeeData || !Array.isArray(promotionRows)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format" 
      });
    }

    const { name, date, currency, company, justification, employeeId } = employeeData;
    const importedPromotions = [];
    
    for (const row of promotionRows) {
      if (!row.property || !row.newValue) {
        console.warn("Skipping row with missing property or new value:", row);
        continue;
      }

      const promotionData = {
        name: name.toString(),
        date: date.toString(),
        currency: currency?.toString() || "INR",
        company: company?.toString() || "Shrirang Automation",
        justification: justification?.toString() || "",
        property: row.property.toString(),
        current: row.current?.toString() || "",
        newValue: row.newValue.toString(),
        employeeId: employeeId?.toString() || ""
      };

      const newPromotion = await EmployeePromotion.create(promotionData);
      importedPromotions.push(newPromotion);
    }

    res.status(201).json({
      success: true,
      message: `${importedPromotions.length} promotion records imported successfully`,
      data: importedPromotions
    });
  } catch (error) {
    console.error("Excel import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};