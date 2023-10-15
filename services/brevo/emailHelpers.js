const BrevoService = require('./brevoService');
const { getTemplateId } = require('./templateConfig');

class EmailHelpers {
  constructor() {
    this.brevoService = new BrevoService();
  }

  // Send welcome message to new users
  async sendWelcomeEmail(userEmail, userName, language = 'en') {
    const welcomeMessages = {
      en: {
        subject: 'Welcome to Our E-commerce Platform!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Welcome ${userName}!</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for joining our e-commerce platform. We're excited to have you as part of our community!</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">You can now browse our products, make purchases, and enjoy exclusive offers.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
              </div>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; text-align: center;">Best regards,<br>E-commerce Team</p>
          </div>
        `
      },
      ar: {
        subject: 'Welcome to our E-commerce Platform!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
            <h2 style="color: #2c3e50; text-align: center;">Welcome ${userName}!</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for joining our e-commerce platform. We're excited to have you as part of our community!</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">You can now browse our products, make purchases, and enjoy exclusive offers.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
              </div>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; text-align: center;">Best regards,<br>E-commerce Team</p>
          </div>
        `
      }
    };

    const message = welcomeMessages[language] || welcomeMessages.en;
    
    return await this.brevoService.sendDirectEmail({
      to: userEmail,
      subject: message.subject,
      htmlContent: message.html
    });
  }

  // Send verification code using Brevo templates
  async sendVerificationEmail(userEmail, userName, verificationCode, language = 'en') {
    try {
      const templateId = getTemplateId('EMAIL_VERIFICATION', language);
      
      return await this.brevoService.sendTemplateEmail({
        to: userEmail,
        templateId: templateId,
        params: {
          name: userName,
          otp: verificationCode,
          expiresIn: process.env.OTP_EXPIRES_IN || 10
        }
      });
    } catch (error) {
      console.error('Error sending verification email via Brevo template:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset code using Brevo templates
  async sendPasswordResetEmail(userEmail, userName, resetCode, language = 'en') {
    try {
      const templateId = getTemplateId('PASSWORD_RESET', language);
      
      return await this.brevoService.sendTemplateEmail({
        to: userEmail,
        templateId: templateId,
        params: {
          name: userName,
          otp: resetCode,
          expiresIn: process.env.OTP_EXPIRES_IN || 15
        }
      });
    } catch (error) {
      console.error('Error sending password reset email via Brevo template:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send order confirmation
  async sendOrderConfirmationEmail(userEmail, userName, orderDetails, language = 'en') {
    const confirmationMessages = {
      en: {
        subject: `Order Confirmation #${orderDetails.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Order Confirmation</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; color: #555;">Hello ${userName},</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for your order! Here are the details:</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
                <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
              </div>
              <p style="font-size: 14px; color: #7f8c8d;">We'll send you another email when your order ships.</p>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; text-align: center;">Best regards,<br>E-commerce Team</p>
          </div>
        `
      },
      ar: {
        subject: `Order Confirmation #${orderDetails.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
            <h2 style="color: #2c3e50; text-align: center;">Order Confirmation</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; color: #555;">Hello ${userName},</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for your order! Here are the details:</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Order Number:</strong> ${orderDetails.orderId}</p>
                <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
                <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
              </div>
              <p style="font-size: 14px; color: #7f8c8d;">We'll send you another email when your order ships.</p>
            </div>
            <p style="font-size: 14px; color: #7f8c8d; text-align: center;">Best regards,<br>E-commerce Team</p>
          </div>
        `
      }
    };

    const message = confirmationMessages[language] || confirmationMessages.en;
    
    return await this.brevoService.sendDirectEmail({
      to: userEmail,
      subject: message.subject,
      htmlContent: message.html
    });
  }

  // Send template-based email
  async sendTemplateEmail(to, templateName, params = {}, attachments = null) {
    try {
      const templateId = getTemplateId(templateName);
      return await this.brevoService.sendTemplateEmail({
        to,
        templateId,
        params,
        attachments
      });
    } catch (error) {
      console.error('Template configuration error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test connection
  async testBrevoConnection() {
    return await this.brevoService.testConnection();
  }

  // Get available templates
  async getAvailableTemplates() {
    return await this.brevoService.getTemplates();
  }
}

module.exports = EmailHelpers;