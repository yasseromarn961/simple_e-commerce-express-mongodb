# Brevo Email Service

Email sending service using Brevo API

## Setup

Make sure to add the following variables in the `.env` file:

```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email@domain.com
BREVO_SENDER_NAME=Your Sender Name
```

## Project Structure

```
services/brevo/
├── brevoService.js     # Core Brevo API service
├── emailHelpers.js     # Helper functions for common emails
├── templateConfig.js   # Template name to ID mapping
├── index.js           # Main exports
└── README.md          # This documentation
```

## Usage

### Import Services

```javascript
const { emailHelpers, brevoService } = require('./services/brevo');
```

### Send Direct Message

```javascript
// Send welcome message
const result = await emailHelpers.sendWelcomeEmail(
  'user@example.com',
  'Username',
  'ar' // Language (ar or en)
);

// Send verification code
const result = await emailHelpers.sendVerificationEmail(
  'user@example.com',
  'Username',
  '123456', // Verification code
  'ar'
);

// Send password reset code
const result = await emailHelpers.sendPasswordResetEmail(
  'user@example.com',
  'Username',
  '789012', // Reset code
  'ar'
);

// Send order confirmation
const orderDetails = {
  orderId: 'ORD-12345',
  totalAmount: '99.99',
  orderDate: new Date().toLocaleDateString()
};

const result = await emailHelpers.sendOrderConfirmationEmail(
  'user@example.com',
  'Username',
  orderDetails,
  'ar'
);
```

### Send Custom Message

```javascript
const result = await brevoService.sendDirectEmail({
  to: 'user@example.com',
  subject: 'Message Title',
  htmlContent: '<h1>Message Content</h1><p>Message text here</p>',
  textContent: 'Alternative message text' // Optional
});
```

### Using Template-Based Emails

```javascript
const { emailHelpers } = require('./services/brevo');

// Send using template name (recommended)
const result = await emailHelpers.sendTemplateEmail(
  'user@example.com',
  'EMAIL_VERIFICATION', // Template name
  {
    userName: 'Ahmed',
    verificationCode: '123456'
  }
);
```

### Send Message Using Brevo Template

```javascript
// First, get the list of available templates
const templates = await emailHelpers.getAvailableTemplates();
console.log(templates);

// Then send the message using template ID
const result = await emailHelpers.sendTemplateEmail(
  'user@example.com',
  123, // Template ID
  {
    // Template variables
    name: 'Username',
    product: 'Product Name',
    price: '99.99'
  }
);
```

### Send Message Using BrevoService Directly

```javascript
const result = await brevoService.sendTemplateEmail({
  to: 'user@example.com',
  templateId: 123,
  params: {
    name: 'Username',
    product: 'Product Name'
  }
});
```

### Test Connection

```javascript
const connectionTest = await emailHelpers.testBrevoConnection();
if (connectionTest.success) {
  console.log('Connection with Brevo successful');
} else {
  console.error('Connection failed:', connectionTest.error);
}
```

## Service Response

All functions return an object in the following format:

```javascript
{
  success: true/false,
  messageId: 'message_id', // On success
  data: {}, // Additional data
  error: 'error_message' // On failure
}
```

## Template Configuration

The system uses a template configuration file (`templateConfig.js`) that maps template names to their IDs in Brevo:

```javascript
const { templateConfig } = require('./services/brevo');

// Get template ID by name
const templateId = templateConfig.getTemplateId('EMAIL_VERIFICATION');

// Check if template exists
const exists = templateConfig.templateExists('WELCOME_EMAIL');

// Get all available templates
const allTemplates = templateConfig.getAllTemplates();

// Add new template
templateConfig.addTemplate('NEW_TEMPLATE', 16);

// Update existing template
templateConfig.updateTemplate('EMAIL_VERIFICATION', 3);
```

### Available Templates

- `EMAIL_VERIFICATION` (ID: 2) - Email verification code
- `PASSWORD_RESET` (ID: 3) - Password reset code
- `WELCOME_EMAIL` (ID: 4) - Welcome message
- `ORDER_CONFIRMATION` (ID: 5) - Order confirmation
- `ORDER_SHIPPED` (ID: 6) - Order shipped notification
- `ORDER_DELIVERED` (ID: 7) - Order delivered notification
- `ORDER_CANCELLED` (ID: 8) - Order cancellation
- `NEWSLETTER` (ID: 9) - Newsletter template
- `PROMOTIONAL_OFFER` (ID: 10) - Promotional offers
- `PRODUCT_RECOMMENDATION` (ID: 11) - Product recommendations
- `SUPPORT_TICKET_CREATED` (ID: 12) - Support ticket created
- `SUPPORT_TICKET_RESOLVED` (ID: 13) - Support ticket resolved
- `ACCOUNT_SUSPENDED` (ID: 14) - Account suspension notice
- `ACCOUNT_REACTIVATED` (ID: 15) - Account reactivation notice

## Features

- ✅ Send direct messages
- ✅ Send messages using Brevo templates
- ✅ Support for Arabic and English languages
- ✅ Welcome, verification, and password reset messages
- ✅ Order confirmations
- ✅ Connection testing
- ✅ Get list of available templates
- ✅ Error handling

## Notes

- Make sure Brevo settings are correct in the `.env` file
- The sender email must be verified in Brevo
- Use ready-made templates in Brevo for better design
- All messages support HTML and CSS for formatting