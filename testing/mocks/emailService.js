// Mock email service for testing
module.exports = {
  sendEmail: jest.fn(() => Promise.resolve({ success: true })),
  sendVerificationEmail: jest.fn(() => Promise.resolve({ success: true })),
  sendWelcomeEmail: jest.fn(() => Promise.resolve({ success: true })),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve({ success: true }))
};