const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const EmailHelpers = require('../services/brevo/emailHelpers');

// Initialize email provider based on environment variable
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'nodemailer';
const brevoEmailHelpers = EMAIL_PROVIDER === 'brevo' ? new EmailHelpers() : null;

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const getEmailTemplate = (templateName, language = 'en') => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'email', language, `${templateName}.html`);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    
    // Fallback to English if language template not found
    const fallbackPath = path.join(__dirname, '..', 'templates', 'email', 'en', `${templateName}.html`);
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, 'utf8');
    }
    
    // Return basic template if no file found
    return getBasicTemplate(templateName);
  } catch (error) {
    console.error('Error loading email template:', error);
    return getBasicTemplate(templateName);
  }
};

// Basic email templates (fallback)
const getBasicTemplate = (templateName) => {
  const templates = {
    verification: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #555;">Hello {{name}},</p>
          <p style="font-size: 16px; color: #555;">Thank you for registering with our e-commerce platform. Please use the following OTP to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; background-color: #e9ecef; padding: 15px 25px; border-radius: 5px; letter-spacing: 5px;">{{otp}}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP will expire in {{expiresIn}} minutes.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this verification, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">© 2024 E-Commerce API. All rights reserved.</p>
        </div>
      </div>
    `,
    resetPassword: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #555;">Hello {{name}},</p>
          <p style="font-size: 16px; color: #555;">You have requested to reset your password. Please use the following OTP to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #dc3545; background-color: #f8d7da; padding: 15px 25px; border-radius: 5px; letter-spacing: 5px;">{{otp}}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP will expire in {{expiresIn}} minutes.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">© 2024 E-Commerce API. All rights reserved.</p>
        </div>
      </div>
    `,
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to E-Commerce API!</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #555;">Hello {{name}},</p>
          <p style="font-size: 16px; color: #555;">Welcome to our e-commerce platform! Your email has been successfully verified and your account is now active.</p>
          <p style="font-size: 16px; color: #555;">You can now:</p>
          <ul style="font-size: 16px; color: #555;">
            <li>Browse our products</li>
            <li>Place orders</li>
            <li>Track your purchases</li>
            <li>Manage your profile</li>
          </ul>
          <p style="font-size: 16px; color: #555;">Thank you for choosing us!</p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">© 2024 E-Commerce API. All rights reserved.</p>
        </div>
      </div>
    `
  };
  
  return templates[templateName] || templates.verification;
};

// Replace template variables
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return result;
};

// Send verification email
const sendVerificationEmail = async (email, name, otp, language = 'en') => {
  try {
    // Use Brevo if EMAIL_PROVIDER is set to 'brevo'
    if (EMAIL_PROVIDER === 'brevo' && brevoEmailHelpers) {
      console.log('Sending verification email via Brevo...');
      return await brevoEmailHelpers.sendVerificationEmail(email, name, otp, language);
    }
    
    // Default to Nodemailer
    console.log('Sending verification email via Nodemailer...');
    const transporter = createTransporter();
    
    const template = getEmailTemplate('verification', language);
    const htmlContent = replaceTemplateVariables(template, {
      name,
      otp,
      expiresIn: process.env.OTP_EXPIRES_IN || 10
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: language === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Email Verification',
      html: htmlContent,
      text: `Hello ${name}, your verification OTP is: ${otp}. This OTP will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, otp, language = 'en') => {
  try {
    // Use Brevo if EMAIL_PROVIDER is set to 'brevo'
    if (EMAIL_PROVIDER === 'brevo' && brevoEmailHelpers) {
      console.log('Sending password reset email via Brevo...');
      return await brevoEmailHelpers.sendPasswordResetEmail(email, name, otp, language);
    }
    
    // Default to Nodemailer
    console.log('Sending password reset email via Nodemailer...');
    const transporter = createTransporter();
    
    const template = getEmailTemplate('resetPassword', language);
    const htmlContent = replaceTemplateVariables(template, {
      name,
      otp,
      expiresIn: process.env.OTP_EXPIRES_IN || 10
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset',
      html: htmlContent,
      text: `Hello ${name}, your password reset OTP is: ${otp}. This OTP will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, language = 'en') => {
  try {
    // Use Brevo if EMAIL_PROVIDER is set to 'brevo'
    if (EMAIL_PROVIDER === 'brevo' && brevoEmailHelpers) {
      console.log('Sending welcome email via Brevo...');
      return await brevoEmailHelpers.sendWelcomeEmail(email, name, language);
    }
    
    // Default to Nodemailer
    console.log('Sending welcome email via Nodemailer...');
    const transporter = createTransporter();
    
    const template = getEmailTemplate('welcome', language);
    const htmlContent = replaceTemplateVariables(template, {
      name
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: language === 'ar' ? 'مرحباً بك في متجرنا الإلكتروني' : 'Welcome to E-Commerce API!',
      html: htmlContent,
      text: `Hello ${name}, welcome to our e-commerce platform! Your account has been successfully verified.`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return null;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    // Test Brevo if EMAIL_PROVIDER is set to 'brevo'
    if (EMAIL_PROVIDER === 'brevo' && brevoEmailHelpers) {
      console.log('Testing Brevo email configuration...');
      return await brevoEmailHelpers.testBrevoConnection();
    }
    
    // Default to testing Nodemailer
    console.log('Testing Nodemailer email configuration...');
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Nodemailer email configuration is valid');
    return true;
  } catch (error) {
    console.error(`Email configuration error (${EMAIL_PROVIDER}):`, error);
    return false;
  }
};

// Get current email provider information
const getEmailProviderInfo = () => {
  return {
    provider: EMAIL_PROVIDER,
    isBrevo: EMAIL_PROVIDER === 'brevo',
    isNodemailer: EMAIL_PROVIDER === 'nodemailer' || EMAIL_PROVIDER !== 'brevo'
  };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailConfig,
  getEmailProviderInfo
};

/*
Usage Examples:

1. Send verification email:
   await sendVerificationEmail('user@example.com', 'John Doe', '123456', 'en');

2. Send password reset email:
   await sendPasswordResetEmail('user@example.com', 'John Doe', '654321', 'ar');

3. Send welcome email:
   await sendWelcomeEmail('user@example.com', 'John Doe', 'en');

4. Test email configuration:
   const isValid = await testEmailConfig();

Note: Make sure to set the following environment variables:
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM
- OTP_EXPIRES_IN
*/