const axios = require('axios');

class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL;
    this.senderName = process.env.BREVO_SENDER_NAME;
    this.baseURL = 'https://api.brevo.com/v3';
    
    if (!this.apiKey || !this.senderEmail || !this.senderName) {
      throw new Error('Brevo configuration is missing. Please check your .env file.');
    }
  }

  // Send direct email
  async sendDirectEmail({
    to,
    subject,
    htmlContent,
    textContent = null,
    attachments = null
  }) {
    try {
      const emailData = {
        sender: {
          name: this.senderName,
          email: this.senderEmail
        },
        to: Array.isArray(to) ? to : [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      };

      if (textContent) {
        emailData.textContent = textContent;
      }

      if (attachments) {
        emailData.attachment = attachments;
      }

      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        emailData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messageId,
        data: response.data
      };
    } catch (error) {
      console.error('Brevo Direct Email Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Send email using ready template
  async sendTemplateEmail({
    to,
    templateId,
    params = {},
    attachments = null
  }) {
    try {
      const emailData = {
        sender: {
          name: this.senderName,
          email: this.senderEmail
        },
        to: Array.isArray(to) ? to : [{ email: to }],
        templateId: parseInt(templateId),
        params: params
      };

      if (attachments) {
        emailData.attachment = attachments;
      }

      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        emailData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messageId,
        data: response.data
      };
    } catch (error) {
      console.error('Brevo Template Email Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get list of available templates
  async getTemplates() {
    try {
      const response = await axios.get(
        `${this.baseURL}/smtp/templates`,
        {
          headers: {
            'Accept': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        templates: response.data.templates
      };
    } catch (error) {
      console.error('Brevo Get Templates Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Test connection with Brevo API
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.baseURL}/account`,
        {
          headers: {
            'Accept': 'application/json',
            'api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        account: response.data
      };
    } catch (error) {
      console.error('Brevo Connection Test Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = BrevoService;