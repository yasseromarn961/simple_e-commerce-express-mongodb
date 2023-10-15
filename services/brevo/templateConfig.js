// Brevo email templates configuration
// Maps template names to their corresponding IDs in Brevo

const BREVO_TEMPLATES = {
  // Authentication templates - English
  EMAIL_VERIFICATION: 2,
  PASSWORD_RESET: 3,
  WELCOME_EMAIL: 4,
  
  // Authentication templates - Arabic
  EMAIL_VERIFICATION_AR: 6,
  PASSWORD_RESET_AR: 4,
  
  // Order templates
  ORDER_CONFIRMATION: 5,
  ORDER_SHIPPED: 6,
  ORDER_DELIVERED: 7,
  ORDER_CANCELLED: 8,
  
  // Marketing templates
  NEWSLETTER: 9,
  PROMOTIONAL_OFFER: 10,
  PRODUCT_RECOMMENDATION: 11,
  
  // Support templates
  SUPPORT_TICKET_CREATED: 12,
  SUPPORT_TICKET_RESOLVED: 13,
  ACCOUNT_SUSPENDED: 14,
  ACCOUNT_REACTIVATED: 15
};

// Helper function to get template ID by name and language
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

// Helper function to get all available templates
function getAllTemplates() {
  return Object.keys(BREVO_TEMPLATES);
}

// Helper function to check if template exists
function templateExists(templateName) {
  return templateName in BREVO_TEMPLATES;
}

// Helper function to add new template
function addTemplate(templateName, templateId) {
  if (templateExists(templateName)) {
    throw new Error(`Template '${templateName}' already exists`);
  }
  BREVO_TEMPLATES[templateName] = templateId;
}

// Helper function to update existing template ID
function updateTemplate(templateName, templateId) {
  if (!templateExists(templateName)) {
    throw new Error(`Template '${templateName}' does not exist`);
  }
  BREVO_TEMPLATES[templateName] = templateId;
}

// Helper function to remove template
function removeTemplate(templateName) {
  if (!templateExists(templateName)) {
    throw new Error(`Template '${templateName}' does not exist`);
  }
  delete BREVO_TEMPLATES[templateName];
}

module.exports = {
  BREVO_TEMPLATES,
  getTemplateId,
  getAllTemplates,
  templateExists,
  addTemplate,
  updateTemplate,
  removeTemplate
};