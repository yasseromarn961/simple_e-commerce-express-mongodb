// Test sending verification code using Brevo template ID 2
// Can be run using: node test/testVerificationTemplate.js

require('dotenv').config();
const { emailHelpers } = require('../services/brevo');

async function testVerificationTemplate() {
  console.log('🧪 Testing verification code sending using Brevo template ID 2...');
  console.log('=' .repeat(60));

  // Test data
  const testData = {
    email: process.env.TEST_EMAIL || 'htavian110@gmail.com',
    name: 'Test User',
    otp: '123456',
    language: 'ar'
  };

  console.log('📧 Email:', testData.email);
  console.log('👤 Username:', testData.name);
  console.log('🔢 Verification Code:', testData.otp);
  console.log('🌐 Language:', testData.language);
  console.log('');

  try {
    // Test sending verification code using template
    console.log('📤 Sending verification code using template ID 2...');
    
    const templateResult = await emailHelpers.sendTemplateEmail(
      testData.email,
      'EMAIL_VERIFICATION', // Template name for email verification
      {
        userName: testData.name,
        otp: testData.otp,
        language: testData.language
      }
    );

    if (templateResult.success) {
      console.log('✅ Verification code sent successfully using template!');
      console.log('📨 Message ID:', templateResult.messageId);
      console.log('📊 Response data:', JSON.stringify(templateResult.data, null, 2));
    } else {
      console.log('❌ Failed to send verification code using template:', templateResult.error);
      
      // Try sending using direct message as fallback
      console.log('\n🔄 Trying to send using direct message...');
      
      const directResult = await emailHelpers.sendVerificationEmail(
        testData.email,
        testData.name,
        testData.otp,
        testData.language
      );
      
      if (directResult.success) {
        console.log('✅ Verification code sent successfully using direct message!');
        console.log('📨 Message ID:', directResult.messageId);
      } else {
        console.log('❌ Failed to send verification code using direct message:', directResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Error in verification code sending test:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Verification code sending test completed');
  console.log('\n💡 Notes:');
  console.log('   - Make sure template ID 2 exists in your Brevo account');
  console.log('   - Verify that the template contains variables: name, otp, language');
  console.log('   - To test actual sending, add TEST_EMAIL in .env file');
}

// Run the test
if (require.main === module) {
  testVerificationTemplate().catch(error => {
    console.error('❌ Error running test:', error);
    process.exit(1);
  });
}

module.exports = { testVerificationTemplate };