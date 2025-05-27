const nodemailer = require('nodemailer');

/**
 * Helper function for conditional logging
 * Only logs in development or when DEBUG is true
 */
const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    console.log(...args);
  }
};


const createTransporter = () => {
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD
    }
  };
  
  // Only log configuration in development/debug mode
  debugLog('Email Configuration:', {
    ...emailConfig,
    auth: {
      user: emailConfig.auth.user,
      pass: '********' // Masked for security
    }
  });
  
  return nodemailer.createTransport(emailConfig);
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendEmail = async (options) => {
  try {
    debugLog('Preparing to send email to:', options.to);
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ExpenseApp" <reset@expenseapp.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    debugLog('Mail options:', {
      ...mailOptions,
      text: mailOptions.text.substring(0, 50) + '...' // Log just the beginning of the text
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    debugLog('Email sent:', {
      messageId: info.messageId,
      response: info.response
    });
    
    // For development, log the test URL if using Ethereal
    if (info.testMessageUrl) {
      // Always log the test URL, even in production, as it's only generated
      // when using Ethereal anyway (which is for testing)
      console.log('Email Preview URL: %s', info.testMessageUrl);
    }
    
    return info;
  } catch (error) {
    // Always log errors
    console.error('Error sending email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check your username and password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Check your host and port settings.');
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Generate and send a password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Complete reset URL
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  debugLog('Preparing password reset email for:', email);
  debugLog('Reset URL:', resetUrl);
  
  const subject = 'ExpenseApp - Password Reset';
  const text = `
    You are receiving this email because you (or someone else) has requested a password reset.
    Please click on the following link, or paste it into your browser to complete the process:
    
    ${resetUrl}
    
    If you did not request this, please ignore this email and your password will remain unchanged.
    
    This link will expire in 1 hour.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">ExpenseApp Password Reset</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click on the following button, or paste the link into your browser to complete the process:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <p style="margin-top: 25px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      
      <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">This link will expire in 1 hour.</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
}; 