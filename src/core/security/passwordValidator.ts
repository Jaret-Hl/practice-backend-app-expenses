/**
 * Password validation utility
 * Ensures passwords meet security requirements
 */

export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Minimum length: 12 characters
  if (password.length < 12) {
    errors.push("La contraseña debe tener al menos 12 caracteres");
  }

  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una mayúscula");
  }

  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una minúscula");
  }

  // Must contain number
  if (!/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }

  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial (!@#$%^&*...)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
