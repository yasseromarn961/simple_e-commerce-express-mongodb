// Practical example of using Brevo service in the project

const { emailHelpers, brevoService } = require('../services/brevo');
const User = require('../models/User');

// Example 1: Using Brevo in new user registration
const registerWithBrevo = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create user
    const user = new User({ name, email, password });
    const otp = user.generateOTP();
    await user.save();

    // Send verification message using Brevo
    const emailResult = await emailHelpers.sendVerificationEmail(
      email,
      name,
      otp,
      req.language || 'ar'
    );

    if (emailResult.success) {
      console.log('Verification message sent successfully:', emailResult.messageId);
    } else {
      console.error('Failed to send verification message:', emailResult.error);
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email.',
      data: { userId: user._id }
    });
  } catch (error) {
    next(error);
  }
};

// Example 2: Send welcome message after email verification
const sendWelcomeAfterVerification = async (userId, language = 'ar') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const welcomeResult = await emailHelpers.sendWelcomeEmail(
      user.email,
      user.name,
      language
    );

    if (welcomeResult.success) {
      console.log('Welcome message sent successfully:', welcomeResult.messageId);
    } else {
      console.error('Failed to send welcome message:', welcomeResult.error);
    }

    return welcomeResult;
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return { success: false, error: error.message };
  }
};

// Example 3: Send password reset message
const sendPasswordResetWithBrevo = async (email, language = 'ar') => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const resetCode = user.generateOTP();
    await user.save();

    const resetResult = await emailHelpers.sendPasswordResetEmail(
      email,
      user.name,
      resetCode,
      language
    );

    if (resetResult.success) {
      console.log('Reset code sent successfully:', resetResult.messageId);
    } else {
      console.error('Failed to send reset code:', resetResult.error);
    }

    return resetResult;
  } catch (error) {
    console.error('Error sending reset code:', error);
    return { success: false, error: error.message };
  }
};

// Example 4: Send order confirmation
const sendOrderConfirmation = async (userId, orderData, language = 'ar') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const orderDetails = {
      orderId: orderData.orderId,
      totalAmount: orderData.totalAmount,
      orderDate: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
    };

    const confirmationResult = await emailHelpers.sendOrderConfirmationEmail(
      user.email,
      user.name,
      orderDetails,
      language
    );

    if (confirmationResult.success) {
      console.log('Order confirmation sent successfully:', confirmationResult.messageId);
    } else {
      console.error('Failed to send order confirmation:', confirmationResult.error);
    }

    return confirmationResult;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return { success: false, error: error.message };
  }
};

// Example 5: Send custom message
const sendCustomEmail = async (userEmail, subject, htmlContent, textContent = null) => {
  try {
    const customResult = await brevoService.sendDirectEmail({
      to: userEmail,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    });

    if (customResult.success) {
      console.log('Custom message sent successfully:', customResult.messageId);
    } else {
      console.error('Failed to send custom message:', customResult.error);
    }

    return customResult;
  } catch (error) {
    console.error('Error sending custom message:', error);
    return { success: false, error: error.message };
  }
};

// Example 6: Send message using Brevo template
const sendTemplateEmail = async (userEmail, templateName, templateParams = {}) => {
  try {
    const templateResult = await emailHelpers.sendTemplateEmail(
      userEmail,
      templateName, // Using template name instead of ID
      templateParams
    );

    if (templateResult.success) {
      console.log('Template message sent successfully:', templateResult.messageId);
    } else {
      console.error('Failed to send template message:', templateResult.error);
    }

    return templateResult;
  } catch (error) {
    console.error('Error sending template message:', error);
    return { success: false, error: error.message };
  }
};

// Example 7: Test connection with Brevo
const testBrevoConnection = async () => {
  try {
    const connectionTest = await emailHelpers.testBrevoConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connection with Brevo successful');
      console.log('Account information:', connectionTest.account);
    } else {
      console.error('❌ Connection with Brevo failed:', connectionTest.error);
    }

    return connectionTest;
  } catch (error) {
    console.error('Error testing connection:', error);
    return { success: false, error: error.message };
  }
};

// Example 8: Get list of available templates
const getAvailableTemplates = async () => {
  try {
    const templatesResult = await emailHelpers.getAvailableTemplates();
    
    if (templatesResult.success) {
      console.log('✅ Templates retrieved successfully');
      console.log('Number of available templates:', templatesResult.templates.length);
      
      // Print template information
      templatesResult.templates.forEach(template => {
        console.log(`- Template ${template.id}: ${template.name}`);
      });
    } else {
      console.error('❌ Failed to retrieve templates:', templatesResult.error);
    }

    return templatesResult;
  } catch (error) {
    console.error('Error retrieving templates:', error);
    return { success: false, error: error.message };
  }
};

// Example 9: Send multiple messages (Bulk Email)
const sendBulkEmails = async (recipients, subject, htmlContent) => {
  try {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await brevoService.sendDirectEmail({
        to: recipient.email,
        subject: subject,
        htmlContent: htmlContent.replace('{{name}}', recipient.name)
      });
      
      results.push({
        email: recipient.email,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
      
      // Short delay between messages to avoid Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ ${successCount} messages sent successfully`);
    console.log(`❌ Failed to send ${failCount} messages`);
    
    return {
      success: true,
      results: results,
      summary: {
        total: recipients.length,
        successful: successCount,
        failed: failCount
      }
    };
  } catch (error) {
    console.error('Error sending multiple messages:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  registerWithBrevo,
  sendWelcomeAfterVerification,
  sendPasswordResetWithBrevo,
  sendOrderConfirmation,
  sendCustomEmail,
  sendTemplateEmail,
  testBrevoConnection,
  getAvailableTemplates,
  sendBulkEmails
};