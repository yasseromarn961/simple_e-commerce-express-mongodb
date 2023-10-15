// Test file for Brevo template configuration
require('dotenv').config();
const { templateConfig } = require('../services/brevo');

async function testTemplateConfiguration() {
  console.log('=== Testing Brevo Template Configuration ===\n');

  try {
    // Test 1: Get template ID by name
    console.log('1. Testing getTemplateId function:');
    try {
      const verificationId = templateConfig.getTemplateId('EMAIL_VERIFICATION');
      console.log(`✓ EMAIL_VERIFICATION template ID: ${verificationId}`);
      
      const welcomeId = templateConfig.getTemplateId('WELCOME_EMAIL');
      console.log(`✓ WELCOME_EMAIL template ID: ${welcomeId}`);
    } catch (error) {
      console.error('✗ Error getting template ID:', error.message);
    }

    // Test 2: Check if template exists
    console.log('\n2. Testing templateExists function:');
    const existingTemplate = templateConfig.templateExists('EMAIL_VERIFICATION');
    const nonExistingTemplate = templateConfig.templateExists('NON_EXISTING_TEMPLATE');
    console.log(`✓ EMAIL_VERIFICATION exists: ${existingTemplate}`);
    console.log(`✓ NON_EXISTING_TEMPLATE exists: ${nonExistingTemplate}`);

    // Test 3: Get all available templates
    console.log('\n3. Testing getAllTemplates function:');
    const allTemplates = templateConfig.getAllTemplates();
    console.log(`✓ Total templates available: ${allTemplates.length}`);
    console.log('Available templates:');
    allTemplates.forEach((template, index) => {
      const id = templateConfig.getTemplateId(template);
      console.log(`   ${index + 1}. ${template} (ID: ${id})`);
    });

    // Test 4: Add new template
    console.log('\n4. Testing addTemplate function:');
    try {
      templateConfig.addTemplate('TEST_TEMPLATE', 999);
      console.log('✓ Successfully added TEST_TEMPLATE');
      
      const testId = templateConfig.getTemplateId('TEST_TEMPLATE');
      console.log(`✓ TEST_TEMPLATE ID: ${testId}`);
    } catch (error) {
      console.error('✗ Error adding template:', error.message);
    }

    // Test 5: Update existing template
    console.log('\n5. Testing updateTemplate function:');
    try {
      templateConfig.updateTemplate('TEST_TEMPLATE', 1000);
      console.log('✓ Successfully updated TEST_TEMPLATE');
      
      const updatedId = templateConfig.getTemplateId('TEST_TEMPLATE');
      console.log(`✓ Updated TEST_TEMPLATE ID: ${updatedId}`);
    } catch (error) {
      console.error('✗ Error updating template:', error.message);
    }

    // Test 6: Remove template
    console.log('\n6. Testing removeTemplate function:');
    try {
      templateConfig.removeTemplate('TEST_TEMPLATE');
      console.log('✓ Successfully removed TEST_TEMPLATE');
      
      const stillExists = templateConfig.templateExists('TEST_TEMPLATE');
      console.log(`✓ TEST_TEMPLATE still exists: ${stillExists}`);
    } catch (error) {
      console.error('✗ Error removing template:', error.message);
    }

    // Test 7: Error handling
    console.log('\n7. Testing error handling:');
    try {
      templateConfig.getTemplateId('NON_EXISTING_TEMPLATE');
    } catch (error) {
      console.log(`✓ Correctly caught error: ${error.message}`);
    }

    try {
      templateConfig.addTemplate('EMAIL_VERIFICATION', 123);
    } catch (error) {
      console.log(`✓ Correctly caught duplicate error: ${error.message}`);
    }

    try {
      templateConfig.updateTemplate('NON_EXISTING_TEMPLATE', 123);
    } catch (error) {
      console.log(`✓ Correctly caught update error: ${error.message}`);
    }

    try {
      templateConfig.removeTemplate('NON_EXISTING_TEMPLATE');
    } catch (error) {
      console.log(`✓ Correctly caught remove error: ${error.message}`);
    }

    console.log('\n=== Template Configuration Test Completed Successfully! ===');

  } catch (error) {
    console.error('\n=== Template Configuration Test Failed ===');
    console.error('Error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testTemplateConfiguration();
}

module.exports = { testTemplateConfiguration };