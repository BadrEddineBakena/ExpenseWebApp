const Users = require('../models/Users');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sendPasswordResetEmail } = require('../utils/emailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { convertRecordAmounts } = require('../utils/currencyConversion');
const Expenses = require('../models/Expenses');
const Incomes = require('../models/Incomes');
const BudgetGoals = require('../models/BudgetGoals');

/**
 * Helper function for conditional logging
 * Only logs in development or when DEBUG is true
 */
const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    console.log(...args);
  }
};

const getCurrentUser = async (req, res) => {
  const user = await Users.findByPk(req.userID, { // Use userID here
    attributes: { exclude: ['password_hash'] },
  });
  return res.json(user);
};

const isProfileComplete = (user) => {
  return !!(
    user.fullname &&
    user.username &&
    user.email &&
    user.phoneNumber &&
    user.age !== undefined && user.age !== null &&
    user.currency
  );
};

const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    userData.profileComplete = isProfileComplete(userData);
    const newUser = await Users.create(userData);
    return res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser.userID, email: newUser.email, username: newUser.username, profileComplete: newUser.profileComplete },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Determine which field caused the unique constraint violation
      const field = Object.keys(error.fields)[0];
      return res.status(400).json({
        error: `This ${field} is already in use. Please use a different ${field}.`
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    return res.status(500).json({ error: 'Failed to register user' });
  }
};

const updateUserInfo = async (req, res) => {
  const { id } = req.params;
  if (+id !== req.userID) return res.status(403).json({ error: 'Unauthorized' });

  try {
    // Fetch current user data
    const currentUser = await Users.findByPk(id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    // Only update user data, do not update or convert any related records
    const updatedData = { ...currentUser.toJSON(), ...req.body };
    updatedData.profileComplete = isProfileComplete(updatedData);

    const [updated] = await Users.update(updatedData, { where: { userID: id } });
    if (!updated) return res.status(404).json({ error: 'Not found or no change' });

    const updatedUser = await Users.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    return res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user information' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    debugLog(`Processing forgot password request for email: ${email}`);
    
    // Find user by email
    const user = await Users.findOne({ where: { email } });
    
    if (!user) {
      debugLog(`No user found with email: ${email}`);
      // For security reasons, still return success even if user not found
      return res.json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    debugLog(`User found: ${user.username} (ID: ${user.userID})`);
    
    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    debugLog(`Generated reset token: ${resetToken.substring(0, 10)}... (expires: ${resetTokenExpiry})`);
    
    // Update user with reset token
    await Users.update(
      { 
        resetToken, 
        resetTokenExpiry 
      }, 
      { where: { email } }
    );
    
    debugLog('User record updated with reset token');
    
    // Create reset URL - ensure FRONTEND_URL is set or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;
    
    debugLog(`Reset URL generated: ${resetUrl}`);
    
    try {
      // Send the password reset email
      debugLog('Attempting to send password reset email...');
      await sendPasswordResetEmail(email, resetToken, resetUrl);
      debugLog(`Password reset email successfully sent to: ${email}`);
    } catch (emailError) {
      // Always log errors, even in production
      console.error('Error sending password reset email:', emailError);
      console.error('Error details:', emailError.stack);
    }
    
    res.json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Validate inputs
    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    
    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
      return res.status(400).json({
        error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }
    
    // Find user with valid reset token
    const user = await Users.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset token fields
    await Users.update(
      { 
        password_hash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
      { where: { userID: user.userID } }
    );
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: "An error occurred while resetting your password" });
  }
};

const setup2FA = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a TOTP secret
    const secret = speakeasy.generateSecret({ name: `ExpenseApp (${user.email})` });

    // Generate QR code as a Data URL
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));

    await Users.update(
      { twoFactorSecret: secret.base32, backupCodes },
      { where: { userID: req.userID } }
    );

    res.json({ secret: secret.base32, qrCode, backupCodes });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await Users.findByPk(req.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // In a real app, you would verify the TOTP code here
    const isValid = true; // Placeholder for actual TOTP verification

    if (isValid) {
      await Users.update(
        { twoFactorEnabled: true },
        { where: { userID: req.userID } }
      );
      res.json({ verified: true });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA code' });
  }
};

const disable2FA = async (req, res) => {
  try {
    await Users.update(
      { twoFactorEnabled: false, twoFactorSecret: null, backupCodes: null },
      { where: { userID: req.userID } }
    );
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { notifications } = req.body;
    await Users.update(
      { notifications },
      { where: { userID: req.userID } }
    );
    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    await Users.update(
      { theme },
      { where: { userID: req.userID } }
    );
    res.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

module.exports = {
  getCurrentUser,
  registerUser,
  updateUserInfo,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  disable2FA,
  updateNotificationPreferences,
  updateTheme,
};
