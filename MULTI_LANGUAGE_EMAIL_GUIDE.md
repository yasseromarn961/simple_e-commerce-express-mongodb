# Multi-Language Email Template Guide

This guide explains how the email system automatically selects the appropriate Brevo template based on the `Accept-Language` header in API requests.

## Overview

The system now supports automatic template selection based on the user's preferred language, providing a seamless multilingual experience for email communications.

## Template Mapping

### Email Verification Templates
- **English (`Accept-Language: en`)**: Template ID `2`
- **Arabic (`Accept-Language: ar`)**: Template ID `6`
- **Default (no header)**: Template ID `2` (English)

### Password Reset Templates
- **English (`Accept-Language: en`)**: Template ID `3`
- **Arabic (`Accept-Language: ar`)**: Template ID `4`
- **Default (no header)**: Template ID `3` (English)

## How It Works

### 1. Language Detection
The system uses the `languageDetection` middleware to extract the language from the `Accept-Language` header:

```javascript
// Example headers:
Accept-Language: en-US,en;q=0.9
Accept-Language: ar-SA,ar;q=0.9
Accept-Language: en
Accept-Language: ar
```

### 2. Template Selection Logic
The `getTemplateId()` function in `templateConfig.js` handles template selection:

```javascript
function getTemplateId(templateName, language = 'en') {
  // For Arabic language, try to get Arabic-specific template first
  if (language === 'ar') {
    const arabicTemplateName = `${templateName}_AR`;
    const arabicId = BREVO_TEMPLATES[arabicTemplateName];
    if (arabicId) {
      return arabicId;
    }
  }
  
  // Fallback to English template
  const id = BREVO_TEMPLATES[templateName];
  if (!id) {
    throw new Error(`Template '${templateName}' not found in configuration`);
  }
  return id;
}
```

### 3. Email Sending Process
When sending emails, the system:
1. Detects the language from `Accept-Language` header
2. Selects the appropriate template ID
3. Sends the email using the Brevo template
4. Falls back to English template if Arabic template is not available

## API Usage Examples

### Registration with English Template
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```
**Result**: Uses Brevo template ID `2` (English verification email)

### Registration with Arabic Template
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "Password123!"
  }'
```
**Result**: Uses Brevo template ID `6` (Arabic verification email)

### Password Reset with English Template
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "email": "john@example.com"
  }'
```
**Result**: Uses Brevo template ID `3` (English password reset email)

### Password Reset with Arabic Template
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar" \
  -d '{
    "email": "ahmed@example.com"
  }'
```
**Result**: Uses Brevo template ID `4` (Arabic password reset email)

### No Language Header (Default)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Name",
    "email": "user@example.com",
    "password": "Password123!"
  }'
```
**Result**: Uses Brevo template ID `2` (English verification email - default)

## Configuration

### Template Configuration
Templates are configured in `services/brevo/templateConfig.js`:

```javascript
const BREVO_TEMPLATES = {
  // Authentication templates - English
  EMAIL_VERIFICATION: 2,
  PASSWORD_RESET: 3,
  WELCOME_EMAIL: 4,
  
  // Authentication templates - Arabic
  EMAIL_VERIFICATION_AR: 6,
  PASSWORD_RESET_AR: 4,
  
  // Other templates...
};
```

### Environment Variables
Ensure these variables are set in your `.env` file:

```env
EMAIL_PROVIDER=brevo
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=Your Sender Name
```

## Template Parameters

Both English and Arabic templates receive the same parameters:

### Verification Email Parameters
- `name`: User's name
- `otp`: One-time password/verification code
- `expiresIn`: OTP expiration time in minutes

### Password Reset Email Parameters
- `name`: User's name
- `otp`: Password reset code
- `expiresIn`: OTP expiration time in minutes

## Fallback Behavior

1. **Language Fallback**: If an Arabic template is not available, the system falls back to the English template
2. **Provider Fallback**: If Brevo is not configured, the system falls back to Nodemailer
3. **Template Fallback**: If a specific template is not found, an error is thrown

## Testing

Use the provided test file to verify the multi-language functionality:

```bash
node test/multiLanguageTemplateTest.js
```

This test will:
1. Verify template ID selection for different languages
2. Send test emails using both English and Arabic templates
3. Display the template mapping summary

## Supported Languages

Currently supported languages:
- **English (`en`)**: Default language
- **Arabic (`ar`)**: Secondary language with dedicated templates

## Adding New Languages

To add support for a new language (e.g., French):

1. **Add templates to Brevo** and note their IDs
2. **Update `templateConfig.js`**:
   ```javascript
   const BREVO_TEMPLATES = {
     // Existing templates...
     
     // French templates
     EMAIL_VERIFICATION_FR: 10,
     PASSWORD_RESET_FR: 11,
   };
   ```
3. **Update the `getTemplateId()` function** to handle the new language
4. **Update the language detection middleware** to support the new language

## Troubleshooting

### Common Issues

1. **Template not found error**:
   - Verify template IDs in Brevo dashboard
   - Check `templateConfig.js` configuration

2. **Wrong template being used**:
   - Check `Accept-Language` header format
   - Verify language detection middleware is working

3. **Email not sending**:
   - Verify Brevo API key and configuration
   - Check template parameters match Brevo template variables

### Debug Information

The system logs template selection and email sending results:

```
Sending verification email via Brevo...
Using template ID: 6 for language: ar
Email sent successfully: <message-id>
```

## Best Practices

1. **Always include `Accept-Language` header** in API requests for proper localization
2. **Test both languages** when making changes to email functionality
3. **Keep template parameters consistent** across all language versions
4. **Monitor email delivery** using Brevo dashboard analytics
5. **Provide fallback content** in templates for missing parameters

## Security Considerations

- Template IDs are not sensitive information but should be documented
- OTP codes are automatically generated and have expiration times
- Email addresses are validated before sending
- Rate limiting is applied to prevent abuse

This multi-language email system provides a robust foundation for international applications while maintaining simplicity and reliability.