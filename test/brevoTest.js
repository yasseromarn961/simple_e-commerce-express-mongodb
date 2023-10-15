// Brevo service test file
// Can be run using: node test/brevoTest.js

require('dotenv').config();
const { emailHelpers, brevoService } = require('../services/brevo');

async function testBrevoService() {
  console.log('🚀 Starting Brevo service test...');
  console.log('=' .repeat(50));

  // Test 1: Connection check
  console.log('\n1️⃣ Testing connection with Brevo API...');
  try {
    const connectionTest = await emailHelpers.testBrevoConnection();
    if (connectionTest.success) {
      console.log('✅ Connection successful!');
      console.log('📧 Sender email:', process.env.BREVO_SENDER_EMAIL);
      console.log('👤 Sender name:', process.env.BREVO_SENDER_NAME);
    } else {
      console.log('❌ Connection failed:', connectionTest.error);
      return;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return;
  }

  // Test 2: Get available templates
  console.log('\n2️⃣ Getting available templates...');
  try {
    const templatesResult = await emailHelpers.getAvailableTemplates();
    if (templatesResult.success) {
      console.log(`✅ Found ${templatesResult.templates.length} templates`);
      if (templatesResult.templates.length > 0) {
        console.log('📋 First 3 templates:');
        templatesResult.templates.slice(0, 3).forEach(template => {
          console.log(`   - ${template.id}: ${template.name}`);
        });
      }
    } else {
      console.log('❌ Failed to get templates:', templatesResult.error);
    }
  } catch (error) {
    console.log('❌ Error getting templates:', error.message);
  }

  // Test 3: Send test message (optional)
  const testEmail = process.env.TEST_EMAIL; // Can add this in .env for testing
  if (testEmail) {
    console.log('\n3️⃣ Sending test message...');
    try {
      const testResult = await emailHelpers.sendWelcomeEmail(
        testEmail,
        'Test User',
        'ar'
      );
      
      if (testResult.success) {
        console.log('✅ Test message sent successfully!');
        console.log('📨 Message ID:', testResult.messageId);
      } else {
        console.log('❌ Failed to send test message:', testResult.error);
      }
    } catch (error) {
      console.log('❌ Error sending test message:', error.message);
    }
  } else {
    console.log('\n3️⃣ Skipping test message sending (TEST_EMAIL not set)');
    console.log('💡 To test sending, add TEST_EMAIL=your-email@example.com in .env file');
  }

  // Test 4: Send custom message (optional)
  if (testEmail) {
    console.log('\n4️⃣ Sending custom message...');
    try {
      const customHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">🧪 Test Message from Brevo Service</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #555; line-height: 1.6;">This is a test message to confirm that the Brevo service is working correctly.</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">✅ This message was sent at: ${new Date().toLocaleString('en-US')}</p>
          </div>
          <p style="font-size: 14px; color: #7f8c8d; text-align: center;">Best regards,<br>Development Team</p>
        </div>
      `;

      const customResult = await brevoService.sendDirectEmail({
        to: testEmail,
        subject: '🧪 Brevo Service Test - Custom Message',
        htmlContent: customHtml
      });
      
      if (customResult.success) {
        console.log('✅ Custom message sent successfully!');
        console.log('📨 Message ID:', customResult.messageId);
      } else {
        console.log('❌ Failed to send custom message:', customResult.error);
      }
    } catch (error) {
      console.log('❌ Error sending custom message:', error.message);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Brevo service test completed!');
  console.log('\n💡 Tips:');
  console.log('   - Make sure BREVO settings are correct in .env file');
  console.log('   - Verify that sender email is verified in Brevo');
  console.log('   - Use ready-made templates for better design');
}

// Run the test
if (require.main === module) {
  testBrevoService().catch(error => {
    console.error('❌ Error running test:', error);
    process.exit(1);
  });
}

module.exports = { testBrevoService };