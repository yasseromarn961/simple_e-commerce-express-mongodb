# Email Provider Configuration Guide

This guide explains how to configure the email provider for your e-commerce application.

## Overview

The application supports two email providers:
- **Nodemailer**: Direct SMTP configuration (default)
- **Brevo**: Third-party email service with advanced features

## Configuration

### Setting the Email Provider

Add the following variable to your `.env` file:

```env
# EMAIL_PROVIDER options: 'nodemailer' or 'brevo'
EMAIL_PROVIDER=nodemailer
```

### Option 1: Nodemailer (Default)

Set `EMAIL_PROVIDER=nodemailer` and configure the following variables:

```env
EMAIL_PROVIDER=nodemailer

# Nodemailer Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@ecommerce.com
```

### Option 2: Brevo

Set `EMAIL_PROVIDER=brevo` and configure the following variables:

```env
EMAIL_PROVIDER=brevo

# Brevo Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender@example.com
BREVO_SENDER_NAME=Your App Name
```

## Features

### Supported Email Types

Both providers support:
- ✅ Verification emails
- ✅ Password reset emails
- ✅ Welcome emails
- ✅ Multi-language support (English/Arabic)

### Provider-Specific Features

#### Nodemailer
- Direct SMTP connection
- Custom HTML templates
- Full control over email formatting
- Works with any SMTP provider (Gmail, Outlook, etc.)

#### Brevo
- Professional email service
- Advanced analytics and tracking
- Better deliverability rates
- Built-in template management
- API-based sending

## Testing Configuration

You can test your email configuration using the `testEmailConfig()` function:

```javascript
const { testEmailConfig } = require('./utils/email');

// Test the configured email provider
testEmailConfig()
  .then(result => {
    if (result) {
      console.log('Email configuration is working!');
    } else {
      console.log('Email configuration failed!');
    }
  });
```

## Switching Between Providers

To switch between providers:

1. Update the `EMAIL_PROVIDER` variable in your `.env` file
2. Ensure the required configuration variables are set for your chosen provider
3. Restart your application

The application will automatically use the selected provider for all email operations.

## Error Handling

If the selected provider fails:
- The application will log detailed error messages
- Email operations will throw appropriate errors
- Check your configuration variables and network connectivity

## Notes

- The default provider is `nodemailer` if `EMAIL_PROVIDER` is not set
- Both providers support the same API interface
- Language detection works automatically based on user preferences
- All email functions are async and return promises