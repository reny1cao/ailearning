export const AUTH_CONFIG = {
  PASSWORD_REQUIREMENTS: {
    minLength: 12,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    requireLowercase: true
  },
  SESSION: {
    timeoutMinutes: 60,
    maxConcurrentSessions: 1,
    adminTimeoutMinutes: 30
  },
  SECURITY: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireAdminTwoFactor: true,
    passwordExpirationDays: 90
  }
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { PASSWORD_REQUIREMENTS } = AUTH_CONFIG;

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};