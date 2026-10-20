// Shared validation rules used by BOTH the login form (client) and the login
// API route (server), so the exact same rules are enforced on both sides.
// Messages are user-facing, therefore written in pt-BR.

// RFC-lite email shape: no spaces, one "@", at least one dot in the domain.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// bcrypt only considers the first 72 bytes of an input; longer values are
// silently truncated, so we reject them upfront (industry best practice).
export const PASSWORD_MAX_LENGTH = 72;

export const EMAIL_MAX_LENGTH = 254;

/** Returns a pt-BR error message, or null when the email is valid. */
export function validateEmail(rawEmail: string): string | null {
  const email = rawEmail.trim();
  if (email.length === 0) {
    return "Informe o e-mail.";
  }
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
    return "Informe um e-mail válido.";
  }
  return null;
}

/** Returns a pt-BR error message, or null when the password is valid. */
export function validatePassword(rawPassword: string): string | null {
  if (rawPassword.length === 0) {
    return "Informe a senha.";
  }
  if (rawPassword.length > PASSWORD_MAX_LENGTH) {
    return `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  return null;
}
