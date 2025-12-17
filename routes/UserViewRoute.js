const express = require("express");
const router = express.Router();
const {
  createUserView,
  getAllUserViews,
  getUserViewById,
  getUserViewByUserId,
  updateUserView,
  deleteUserView,
  addContact,
  updateContact,
  deleteContact,
  bulkImportContacts
} = require("../controllers/UserViewController");

// Routes
router.route("/")
  .post(createUserView)          // Create new user view
  .get(getAllUserViews);         // Get all user views

router.route("/:id")
  .get(getUserViewById)          // Get single user view by ID
  .put(updateUserView)           // Update user view
  .delete(deleteUserView);       // Delete user view

router.route("/user/:userId")
  .get(getUserViewByUserId);     // Get user view by user ID

router.route("/:id/contacts")
  .post(addContact)              // Add contact to user
  .post(bulkImportContacts);     // Bulk import contacts (same endpoint, different controller)

router.route("/:id/contacts/:contactIndex")
  .put(updateContact)            // Update specific contact
  .delete(deleteContact);        // Delete specific contact

module.exports = router;