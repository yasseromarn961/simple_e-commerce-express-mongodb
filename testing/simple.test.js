// Simple test to verify testing setup
describe('Testing Environment', () => {
  test('should have correct environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_EXPIRE).toBe('7d');
  });
  
  test('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(8 / 2).toBe(4);
  });
  
  test('should handle strings correctly', () => {
    const testString = 'Hello World';
    expect(testString).toBe('Hello World');
    expect(testString.length).toBe(11);
    expect(testString.toLowerCase()).toBe('hello world');
    expect(testString.toUpperCase()).toBe('HELLO WORLD');
  });
  
  test('should handle arrays correctly', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray).toHaveLength(5);
    expect(testArray).toContain(3);
    expect(testArray[0]).toBe(1);
    expect(testArray[testArray.length - 1]).toBe(5);
  });
  
  test('should handle objects correctly', () => {
    const testObject = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    };
    
    expect(testObject).toHaveProperty('name');
    expect(testObject).toHaveProperty('email');
    expect(testObject).toHaveProperty('age');
    expect(testObject.name).toBe('Test User');
    expect(testObject.email).toBe('test@example.com');
    expect(testObject.age).toBe(25);
  });
  
  test('should handle async operations', async () => {
    const asyncFunction = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Async result');
        }, 100);
      });
    };
    
    const result = await asyncFunction();
    expect(result).toBe('Async result');
  });
  
  test('should handle promises', () => {
    const promiseFunction = () => {
      return Promise.resolve('Promise result');
    };
    
    return expect(promiseFunction()).resolves.toBe('Promise result');
  });
  
  test('should handle rejected promises', () => {
    const rejectFunction = () => {
      return Promise.reject(new Error('Promise rejected'));
    };
    
    return expect(rejectFunction()).rejects.toThrow('Promise rejected');
  });
  
  test('should mock functions correctly', () => {
    const mockFunction = jest.fn();
    mockFunction('test argument');
    
    expect(mockFunction).toHaveBeenCalled();
    expect(mockFunction).toHaveBeenCalledWith('test argument');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
  
  test('should mock return values', () => {
    const mockFunction = jest.fn();
    mockFunction.mockReturnValue('mocked value');
    
    const result = mockFunction();
    expect(result).toBe('mocked value');
  });
});