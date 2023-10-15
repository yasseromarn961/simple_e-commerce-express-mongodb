// Mock OTP service for testing
module.exports = {
  generateOTP: jest.fn(() => '123456'),
  verifyOTP: jest.fn(() => true),
  sendOTP: jest.fn(() => Promise.resolve({ success: true }))
};