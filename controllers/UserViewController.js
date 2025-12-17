const UserView = require("../models/UserViewModel");

// Create new user view
exports.createUserView = async (req, res) => {
  try {
    const { 
      userId, 
      userName,
      employeeId,
      role, 
      department, 
      performance, 
      q2Score, 
      q1GoalsMet, 
      q2GoalsMet,
      contacts,
      documents 
    } = req.body;
    
    // Validate required fields
    if (!userId || !userName) {
      return res.status(400).json({ 
        success: false,
        error: "User ID and User Name are required fields" 
      });
    }

    // Check if user already exists
    const existingUser = await UserView.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: "User already exists" 
      });
    }

    const userData = {
      userId,
      userName,
      employeeId: employeeId || "",
      role: role || "Data Analyst",
      department: department || "Tech",
      performance: performance || "Excellent",
      q2Score: q2Score || 85,
      q1GoalsMet: q1GoalsMet || 4,
      q2GoalsMet: q2GoalsMet || 3,
      contacts: contacts || [],
      documents: documents || []
    };

    const newUserView = await UserView.create(userData);
    
    res.status(201).json({
      success: true,
      message: "User view created successfully",
      data: newUserView
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all user views
exports.getAllUserViews = async (req, res) => {
  try {
    const users = await UserView.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single user view by ID
exports.getUserViewById = async (req, res) => {
  try {
    const user = await UserView.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get user view by user ID
exports.getUserViewByUserId = async (req, res) => {
  try {
    const user = await UserView.findOne({ userId: req.params.userId });
    
    if (!user) {
      // Return default user if not found
      const defaultUser = {
        userId: req.params.userId || "ethan-hunt",
        userName: "Ethan Hunt",
        employeeId: "EMP-001",
        role: "Data Analyst",
        department: "Tech",
        performance: "Excellent",
        q2Score: 85,
        q1GoalsMet: 4,
        q2GoalsMet: 3,
        contacts: [
          {
            name: "Ethan Hunt",
            employeeId: "EMP-001",
            phone: "555-100-2222",
            contact: "John Doe (Friend)",
            address: "10 Wall Street, New York, USA"
          },
          {
            name: "Ethan Hunt",
            employeeId: "EMP-001",
            phone: "777-345-6789",
            contact: "Steve Smith (Brother)",
            address: "55 Silicon Valley, California, USA"
          },
          {
            name: "Ethan Hunt",
            employeeId: "EMP-001",
            phone: "999-555-3333",
            contact: "Martha Wayne (Mother)",
            address: "Gotham City, Wayne Tower USA"
          }
        ],
        documents: [
          {
            name: "Last Review",
            type: "PDF",
            url: "#"
          },
          {
            name: "PDP (Development Plan)",
            type: "OTHER",
            url: "#"
          }
        ]
      };
      
      return res.status(200).json({
        success: true,
        data: defaultUser,
        message: "Using default user data"
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Fetch by userId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update user view
exports.updateUserView = async (req, res) => {
  try {
    const { 
      userId,
      userName,
      employeeId,
      role, 
      department, 
      performance, 
      q2Score, 
      q1GoalsMet, 
      q2GoalsMet,
      contacts,
      documents 
    } = req.body;
    
    // Check if user exists
    const existingUser = await UserView.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    const updateData = {
      userId: userId || existingUser.userId,
      userName: userName || existingUser.userName,
      employeeId: employeeId !== undefined ? employeeId : existingUser.employeeId,
      role: role !== undefined ? role : existingUser.role,
      department: department !== undefined ? department : existingUser.department,
      performance: performance !== undefined ? performance : existingUser.performance,
      q2Score: q2Score !== undefined ? q2Score : existingUser.q2Score,
      q1GoalsMet: q1GoalsMet !== undefined ? q1GoalsMet : existingUser.q1GoalsMet,
      q2GoalsMet: q2GoalsMet !== undefined ? q2GoalsMet : existingUser.q2GoalsMet,
      contacts: contacts !== undefined ? contacts : existingUser.contacts,
      documents: documents !== undefined ? documents : existingUser.documents
    };

    const updatedUser = await UserView.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User view updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Add contact to user
exports.addContact = async (req, res) => {
  try {
    const { name, employeeId, phone, contact, address } = req.body;
    
    // Validate required fields
    if (!name || !employeeId || !phone || !contact || !address) {
      return res.status(400).json({ 
        success: false,
        error: "Name, Employee ID, Phone, Contact, and Address are required" 
      });
    }

    const user = await UserView.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    const newContact = { name, employeeId, phone, contact, address };
    user.contacts.push(newContact);
    
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Contact added successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Add contact error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const { name, employeeId, phone, contact, address } = req.body;
    const { id, contactIndex } = req.params;
    
    const user = await UserView.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    if (contactIndex < 0 || contactIndex >= user.contacts.length) {
      return res.status(404).json({ 
        success: false,
        error: "Contact not found" 
      });
    }

    // Update the contact
    if (name !== undefined) user.contacts[contactIndex].name = name;
    if (employeeId !== undefined) user.contacts[contactIndex].employeeId = employeeId;
    if (phone !== undefined) user.contacts[contactIndex].phone = phone;
    if (contact !== undefined) user.contacts[contactIndex].contact = contact;
    if (address !== undefined) user.contacts[contactIndex].address = address;
    
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const { id, contactIndex } = req.params;
    
    const user = await UserView.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    if (contactIndex < 0 || contactIndex >= user.contacts.length) {
      return res.status(404).json({ 
        success: false,
        error: "Contact not found" 
      });
    }

    // Remove the contact
    user.contacts.splice(contactIndex, 1);
    
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete user view
exports.deleteUserView = async (req, res) => {
  try {
    const user = await UserView.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    await UserView.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "User view deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Bulk import contacts
exports.bulkImportContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const contactsData = req.body;
    
    if (!Array.isArray(contactsData) || contactsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const user = await UserView.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User view not found" 
      });
    }

    const importedContacts = [];
    
    for (const contact of contactsData) {
      // Validate required fields
      if (!contact.name || !contact.employeeId || !contact.phone || !contact.contact || !contact.address) {
        console.warn("Skipping contact with missing required fields:", contact);
        continue;
      }

      const newContact = {
        name: contact.name.toString(),
        employeeId: contact.employeeId.toString(),
        phone: contact.phone.toString(),
        contact: contact.contact.toString(),
        address: contact.address.toString()
      };

      user.contacts.push(newContact);
      importedContacts.push(newContact);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: `${importedContacts.length} contacts imported successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};