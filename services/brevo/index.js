const BrevoService = require('./brevoService');
const EmailHelpers = require('./emailHelpers');
const templateConfig = require('./templateConfig');

// Create a single instance of the services
const brevoService = new BrevoService();
const emailHelpers = new EmailHelpers();

module.exports = {
  BrevoService,
  EmailHelpers,
  brevoService,
  emailHelpers,
  templateConfig
};