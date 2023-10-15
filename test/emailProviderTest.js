/**
 * Email Provider Test
 * This file demonstrates how to test different email providers
 */

// Load environment variables
require('dotenv').config();

const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail, 
  testEmailConfig,
  getEmailProviderInfo 
} = require('../utils/email');

// Test email configuration
async function testEmailProviders() {
  console.log('=== Email Provider Test ===\n');
  
  // Get current provider info
  const providerInfo = getEmailProviderInfo();
  console.log('Current Email Provider:', providerInfo);
  console.log('');
  
  // Test email configuration
  console.log('Testing email configuration...');
  const configTest = await testEmailConfig();
  console.log('Configuration test result:', configTest ? 'PASSED' : 'FAILED');
  console.log('');
  
  if (configTest) {
    // Test sending emails (uncomment to actually send)
    /*
    try {
      console.log('Testing verification email...');
      await sendVerificationEmail('test@example.com', 'Test User', '123456', 'en');
      console.log('Verification email sent successfully!');
      
      console.log('Testing password reset email...');
      await sendPasswordResetEmail('test@example.com', 'Test User', '654321', 'en');
      console.log('Password reset email sent successfully!');
      
      console.log('Testing welcome email...');
      await sendWelcomeEmail('test@example.com', 'Test User', 'en');
      console.log('Welcome email sent successfully!');
      
    } catch (error) {
      console.error('Error sending test emails:', error.message);
    }
    */
    
    console.log('Email provider is configured correctly!');
    console.log('Uncomment the test email section to send actual test emails.');
  } else {
    console.log('Please check your email configuration in .env file');
    
    if (providerInfo.isNodemailer) {
      console.log('Required Nodemailer variables:');
      console.log('- EMAIL_HOST');
      console.log('- EMAIL_PORT');
      console.log('- EMAIL_USER');
      console.log('- EMAIL_PASS');
      console.log('- EMAIL_FROM');
    } else if (providerInfo.isBrevo) {
      console.log('Required Brevo variables:');
      console.log('- BREVO_API_KEY');
      console.log('- BREVO_SENDER_EMAIL');
      console.log('- BREVO_SENDER_NAME');
    }
  }
}

// Run the test
if (require.main === module) {
  testEmailProviders()
    .then(() => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testEmailProviders
};