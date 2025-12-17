const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeResignationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      default: function() {
        // Generate employee ID in format: EMP-RES-YYYY-MM-XXXX
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
        return `EMP-RES-${year}-${month}-${randomNum}`;
      }
    },
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    email: {
      type: String,
      required: [true, "Personal Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    workEmail: {
      type: String,
      required: [true, "Work Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
    },
    emergencyContact: {
      type: String,
      required: [true, "Emergency Contact is required"],
      trim: true,
      unique: true,
    },
    hireDate: {
      type: Date,
      required: [true, "Hire Date is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    reportingManager: {
      type: String,
      required: [true, "Reporting Manager is required"],
      trim: true,
    },
    addedOn: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    currentAddress: {
      type: String,
      required: [true, "Current Address is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    panNo: {
      type: String,
      required: [true, "PAN Number is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    // Password field for employee login
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    status: {
      type: String,
      enum: ["Pending", "Processed", "Rejected"],
      default: "Pending",
    },
    resignationDate: {
      type: Date,
      default: Date.now,
    },
    lastWorkingDay: {
      type: Date,
    },
    resignationReason: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Add login-related fields
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
employeeResignationSchema.index({ employeeId: 1 });
employeeResignationSchema.index({ email: 1 });
employeeResignationSchema.index({ workEmail: 1 });
employeeResignationSchema.index({ phone: 1 });
employeeResignationSchema.index({ emergencyContact: 1 });
employeeResignationSchema.index({ panNo: 1 });
employeeResignationSchema.index({ status: 1 });
employeeResignationSchema.index({ addedOn: -1 });
employeeResignationSchema.index({ fullName: 1 });
employeeResignationSchema.index({ department: 1 });
employeeResignationSchema.index({ reportingManager: 1 });

// Hash password before saving
employeeResignationSchema.pre('save', async function(next) {
  try {
    // Only generate new employeeId if it's a new document
    if (this.isNew) {
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        // Generate employee ID in format: EMP-RES-YYYY-MM-XXXX
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
        const generatedId = `EMP-RES-${year}-${month}-${randomNum}`;
        
        // Check if this ID already exists
        const existingDoc = await this.constructor.findOne({ employeeId: generatedId });
        
        if (!existingDoc) {
          this.employeeId = generatedId;
          isUnique = true;
        }
        
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Could not generate unique employee ID after multiple attempts');
      }
    }

    // Hash password if it's modified or new
    if (this.isModified('password') || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
employeeResignationSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
employeeResignationSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
employeeResignationSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // Lock for 2 hours
  }
  
  return await this.updateOne(updates);
};

// Reset login attempts on successful login
employeeResignationSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { lastLogin: Date.now() },
    $unset: { 
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

module.exports = mongoose.model("EmployeeResignation", employeeResignationSchema);