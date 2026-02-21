const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
    register,
    login,
    createStaff,
    getProfile,
    updateProfile,
    registerSchema,
    loginSchema,
    createStaffSchema,
    updateProfileSchema
} = require('../controllers/authController');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/staff', authenticate, authorize(['admin']), validate(createStaffSchema), createStaff);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

module.exports = router;
