const KRA = require("../models/KRAModel");

// Create new KRA
exports.createKRA = async (req, res) => {
  try {
    const { template, manualRate, kra, weightage, goalCompletion, editable, employee, employeeId } = req.body;
    
    // Calculate goalScore if weightage and completion are provided
    let goalScore = "";
    if (weightage && goalCompletion) {
      const weightageNum = parseFloat(weightage) || 0;
      const completionNum = parseFloat(goalCompletion) || 0;
      goalScore = ((weightageNum * completionNum) / 100).toFixed(2);
    }

    const kraData = {
      template: template || "",
      manualRate: manualRate || false,
      kra: kra || "",
      weightage: weightage || "",
      goalCompletion: goalCompletion || "",
      goalScore: goalScore,
      editable: editable !== undefined ? editable : true,
      employee: employee || "",
      employeeId: employeeId || ""
    };

    const newKRA = await KRA.create(kraData);
    
    res.status(201).json({
      success: true,
      message: "KRA created successfully",
      data: newKRA
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all KRAs
exports.getAllKRAs = async (req, res) => {
  try {
    const kras = await KRA.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: kras.length,
      data: kras
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single KRA by ID
exports.getKRAById = async (req, res) => {
  try {
    const kra = await KRA.findById(req.params.id);
    
    if (!kra) {
      return res.status(404).json({ 
        success: false,
        error: "KRA not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: kra
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update KRA
exports.updateKRA = async (req, res) => {
  try {
    const { template, manualRate, kra, weightage, goalCompletion, editable, employee, employeeId } = req.body;
    
    // Check if KRA exists
    const existingKRA = await KRA.findById(req.params.id);
    if (!existingKRA) {
      return res.status(404).json({ 
        success: false,
        error: "KRA not found" 
      });
    }

    // Calculate goalScore
    let goalScore = existingKRA.goalScore;
    if (weightage || goalCompletion) {
      const weightageNum = parseFloat(weightage || existingKRA.weightage) || 0;
      const completionNum = parseFloat(goalCompletion || existingKRA.goalCompletion) || 0;
      goalScore = ((weightageNum * completionNum) / 100).toFixed(2);
    }

    const updateData = {
      template: template !== undefined ? template : existingKRA.template,
      manualRate: manualRate !== undefined ? manualRate : existingKRA.manualRate,
      kra: kra !== undefined ? kra : existingKRA.kra,
      weightage: weightage !== undefined ? weightage : existingKRA.weightage,
      goalCompletion: goalCompletion !== undefined ? goalCompletion : existingKRA.goalCompletion,
      goalScore: goalScore,
      editable: editable !== undefined ? editable : existingKRA.editable,
      employee: employee !== undefined ? employee : existingKRA.employee,
      employeeId: employeeId !== undefined ? employeeId : existingKRA.employeeId
    };

    const updatedKRA = await KRA.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "KRA updated successfully",
      data: updatedKRA
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete KRA
exports.deleteKRA = async (req, res) => {
  try {
    const kra = await KRA.findById(req.params.id);
    
    if (!kra) {
      return res.status(404).json({ 
        success: false,
        error: "KRA not found" 
      });
    }

    await KRA.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "KRA deleted successfully"
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
exports.bulkImportKRAs = async (req, res) => {
  try {
    const krasData = req.body;
    
    if (!Array.isArray(krasData) || krasData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedKRAs = [];
    
    for (const k of krasData) {
      // Calculate goal score
      const weightageNum = parseFloat(k.weightage) || 0;
      const completionNum = parseFloat(k.goalCompletion) || 0;
      const goalScore = weightageNum && completionNum ? 
        ((weightageNum * completionNum) / 100).toFixed(2) : 
        "";

      const kraData = {
        template: k.template?.toString() || "",
        manualRate: k.manualRate || false,
        kra: k.kra?.toString() || "",
        weightage: k.weightage?.toString() || "",
        goalCompletion: k.goalCompletion?.toString() || "",
        goalScore: goalScore,
        editable: k.editable !== undefined ? k.editable : false,
        employee: k.employee?.toString() || "",
        employeeId: k.employeeId?.toString() || ""
      };

      const newKRA = await KRA.create(kraData);
      importedKRAs.push(newKRA);
    }

    res.status(201).json({
      success: true,
      message: `${importedKRAs.length} KRAs imported successfully`,
      data: importedKRAs
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Clear all KRAs
exports.clearAllKRAs = async (req, res) => {
  try {
    await KRA.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: "All KRAs cleared successfully"
    });
  } catch (error) {
    console.error("Clear all error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};