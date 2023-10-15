const fs = require('fs');
const path = require('path');

// Cache for loaded translations
const translationsCache = {};

// Load translation file
const loadTranslations = (language) => {
  if (translationsCache[language]) {
    return translationsCache[language];
  }

  try {
    const filePath = path.join(__dirname, '..', 'locales', `${language}.json`);
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    translationsCache[language] = translations;
    return translations;
  } catch (error) {
    console.warn(`Translation file not found for language: ${language}`);
    // Fallback to English if translation file not found
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
};

// Language detection middleware
const languageDetection = (req, res, next) => {
  // Get language from Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  let language = null; // No default language initially
  let isBilingual = false; // Flag to determine if response should be bilingual

  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0].toLowerCase();
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find supported language
    const supportedLanguages = ['en', 'ar'];
    for (const lang of languages) {
      const langCode = lang.code.split('-')[0]; // Get primary language code
      if (supportedLanguages.includes(langCode)) {
        language = langCode;
        break;
      }
    }
  }

  // If no Accept-Language header or no supported language found, use bilingual mode
  if (!language) {
    isBilingual = true;
    language = 'en'; // Default for fallback purposes
  }

  // Load translations for the detected language
  const translations = loadTranslations(language);
  
  // Load both translations for bilingual mode
  const enTranslations = loadTranslations('en');
  const arTranslations = loadTranslations('ar');

  // Add language and translation function to request object
  req.language = language;
  req.isBilingual = isBilingual;
  req.translations = translations;
  req.enTranslations = enTranslations;
  req.arTranslations = arTranslations;
  
  // Helper function to get translated message
  req.t = (key, defaultValue = key) => {
    if (req.isBilingual) {
      // Return both languages when in bilingual mode
      const enKeys = key.split('.');
      const arKeys = key.split('.');
      
      let enValue = enTranslations;
      let arValue = arTranslations;
      
      // Get English translation
      for (const k of enKeys) {
        if (enValue && typeof enValue === 'object' && enValue[k] !== undefined) {
          enValue = enValue[k];
        } else {
          enValue = defaultValue;
          break;
        }
      }
      
      // Get Arabic translation
      for (const k of arKeys) {
        if (arValue && typeof arValue === 'object' && arValue[k] !== undefined) {
          arValue = arValue[k];
        } else {
          arValue = defaultValue;
          break;
        }
      }
      
      return {
        en: typeof enValue === 'string' ? enValue : defaultValue,
        ar: typeof arValue === 'string' ? arValue : defaultValue
      };
    } else {
      // Single language mode
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && value[k] !== undefined) {
          value = value[k];
        } else {
          return defaultValue;
        }
      }
      
      return typeof value === 'string' ? value : defaultValue;
    }
  };

  // Helper function to send localized response
  res.localizedJson = (statusCode, data) => {
    // Create a copy of data to avoid modifying the original
    const responseData = { ...data };
    
    // If data has a message key, translate it
    if (responseData && typeof responseData === 'object' && responseData.message) {
      responseData.message = req.t(responseData.message, responseData.message);
    }
    
    // If data has an error key, translate it
    if (responseData && typeof responseData === 'object' && responseData.error) {
      responseData.error = req.t(responseData.error, responseData.error);
    }
    
    // If data has errors array, translate each error
    if (responseData && typeof responseData === 'object' && Array.isArray(responseData.errors)) {
      responseData.errors = responseData.errors.map(error => {
        if (typeof error === 'string') {
          return req.t(error, error);
        }
        if (typeof error === 'object' && error.message) {
          return {
            ...error,
            message: req.t(error.message, error.message)
          };
        }
        return error;
      });
    }
    
    // Add language information to response
    if (req.isBilingual) {
      responseData.language = 'bilingual';
      responseData.supportedLanguages = ['en', 'ar'];
    } else {
      responseData.language = req.language;
    }
    
    return res.status(statusCode).json(responseData);
  };

  next();
};

module.exports = languageDetection;

/*
Usage Examples:

1. In controllers:
   res.localizedJson(200, { message: 'auth.login_success' });
   
2. Direct translation:
   const message = req.t('auth.invalid_credentials', 'Invalid credentials');
   
3. Error handling:
   res.localizedJson(400, { 
     error: 'validation.required_field',
     errors: ['validation.email_required', 'validation.password_required']
   });

4. Language detection:
   console.log('Detected language:', req.language);
*/