require('dotenv').config();
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { getTemplateId } = require('../services/brevo/templateConfig');

// Test multi-language template selection
async function testMultiLanguageTemplates() {
  console.log('=== Multi-Language Template Test ===\n');
  
  // Test template ID selection for different languages
  console.log('1. Testing Template ID Selection:');
  
  try {
    // Test English templates (default)
    const enVerificationId = getTemplateId('EMAIL_VERIFICATION', 'en');
    const enPasswordResetId = getTemplateId('PASSWORD_RESET', 'en');
    console.log(`   English EMAIL_VERIFICATION template ID: ${enVerificationId}`);
    console.log(`   English PASSWORD_RESET template ID: ${enPasswordResetId}`);
    
    // Test Arabic templates
    const arVerificationId = getTemplateId('EMAIL_VERIFICATION', 'ar');
    const arPasswordResetId = getTemplateId('PASSWORD_RESET', 'ar');
    console.log(`   Arabic EMAIL_VERIFICATION template ID: ${arVerificationId}`);
    console.log(`   Arabic PASSWORD_RESET template ID: ${arPasswordResetId}`);
    
    // Test fallback to English when no Accept-Language header
    const defaultVerificationId = getTemplateId('EMAIL_VERIFICATION');
    const defaultPasswordResetId = getTemplateId('PASSWORD_RESET');
    console.log(`   Default EMAIL_VERIFICATION template ID: ${defaultVerificationId}`);
    console.log(`   Default PASSWORD_RESET template ID: ${defaultPasswordResetId}`);
    
  } catch (error) {
    console.error('   Error testing template IDs:', error.message);
  }
  
  console.log('\n2. Testing Email Sending with Language Support:');
  
  // Test email sending with different languages
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'Test User';
  const testOTP = '123456';
  
  if (process.env.EMAIL_PROVIDER === 'brevo' && process.env.BREVO_API_KEY) {
    try {
      console.log('\n   Testing English verification email...');
      const enResult = await sendVerificationEmail(testEmail, testName, testOTP, 'en');
      console.log('   English verification email result:', enResult.success ? 'SUCCESS' : 'FAILED');
      if (enResult.messageId) {
        console.log('   Message ID:', enResult.messageId);
      }
      
      console.log('\n   Testing Arabic verification email...');
      const arResult = await sendVerificationEmail(testEmail, testName, testOTP, 'ar');
      console.log('   Arabic verification email result:', arResult.success ? 'SUCCESS' : 'FAILED');
      if (arResult.messageId) {
        console.log('   Message ID:', arResult.messageId);
      }
      
      console.log('\n   Testing English password reset email...');
      const enResetResult = await sendPasswordResetEmail(testEmail, testName, testOTP, 'en');
      console.log('   English password reset email result:', enResetResult.success ? 'SUCCESS' : 'FAILED');
      if (enResetResult.messageId) {
        console.log('   Message ID:', enResetResult.messageId);
      }
      
      console.log('\n   Testing Arabic password reset email...');
      const arResetResult = await sendPasswordResetEmail(testEmail, testName, testOTP, 'ar');
      console.log('   Arabic password reset email result:', arResetResult.success ? 'SUCCESS' : 'FAILED');
      if (arResetResult.messageId) {
        console.log('   Message ID:', arResetResult.messageId);
      }
      
    } catch (error) {
      console.error('   Error sending test emails:', error.message);
    }
  } else {
    console.log('   Skipping email sending tests (Brevo not configured or not selected)');
    console.log('   Current EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'nodemailer');
  }
  
  console.log('\n3. Template Mapping Summary:');
  console.log('   Accept-Language: en -> EMAIL_VERIFICATION template ID: 2');
  console.log('   Accept-Language: ar -> EMAIL_VERIFICATION template ID: 6');
  console.log('   Accept-Language: en -> PASSWORD_RESET template ID: 3');
  console.log('   Accept-Language: ar -> PASSWORD_RESET template ID: 4');
  console.log('   No Accept-Language -> Defaults to English templates');
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testMultiLanguageTemplates().catch(console.error);