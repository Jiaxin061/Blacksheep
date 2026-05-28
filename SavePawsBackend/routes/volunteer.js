const express = require('express');
const router = express.Router();
const { VolunteerController } = require('../controllers/VolunteerController');
const { requireAuth, requireAdmin } = require('../middleware/demoAuth');

// Volunteer Registration (UC07)
router.post('/volunteer/register', VolunteerController.submitRegistration);
router.get('/volunteer/status/:userId', VolunteerController.checkVolunteerStatus);
router.get('/volunteer/registration/:userId', VolunteerController.getRegistrationDetails);
router.get('/volunteer/contributions/:userId', VolunteerController.getContributions);

// Volunteer Events
router.get('/events', VolunteerController.getAvailableEvents);
router.get('/events/:eventId', VolunteerController.getEventDetails);
router.post('/events/register', VolunteerController.registerForEvent);
router.get('/events/user/:userId', VolunteerController.getUserEvents);

// ==================== ADMIN ROUTES ====================
const AdminEventController = require('../controllers/AdminEventController');
const AdminRegistrationController = require('../controllers/AdminRegistrationController');

// Apply authentication middleware to admin routes only
// Event Management
router.get('/admin/events', requireAdmin, AdminEventController.getEvents);
router.post('/admin/events', requireAdmin, AdminEventController.createEvent);
router.put('/admin/events/:id', requireAdmin, AdminEventController.updateEvent);
router.delete('/admin/events/:id', requireAdmin, AdminEventController.deleteEvent);

// Registration Management
router.get('/admin/registrations', requireAdmin, AdminRegistrationController.getPendingRegistrations);
router.post('/admin/registrations/:id/approve', requireAdmin, AdminRegistrationController.approveRegistration);
router.post('/admin/registrations/:id/reject', requireAdmin, AdminRegistrationController.rejectRegistration);



module.exports = router;
