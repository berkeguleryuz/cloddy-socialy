export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 10;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Lowercased reserved handles. Users cannot mint these.
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  "admin",
  "administrator",
  "support",
  "help",
  "cloddy",
  "berke",
  "omegayon",
  "root",
  "moderator",
  "mod",
  "system",
  "api",
  "www",
  "null",
  "undefined",
]);

export type UsernameValidationError =
  | "too_short"
  | "too_long"
  | "invalid_chars"
  | "reserved";

export type UsernameValidationResult =
  | { valid: true; handle: string; display: string }
  | { valid: false; reason: UsernameValidationError };

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function isUsernameReserved(input: string): boolean {
  return RESERVED_USERNAMES.has(normalizeUsername(input));
}

export function validateUsername(input: string): UsernameValidationResult {
  const display = input.trim();
  const handle = display.toLowerCase();

  if (handle.length < USERNAME_MIN_LENGTH) {
    return { valid: false, reason: "too_short" };
  }
  if (handle.length > USERNAME_MAX_LENGTH) {
    return { valid: false, reason: "too_long" };
  }
  if (!USERNAME_PATTERN.test(display)) {
    return { valid: false, reason: "invalid_chars" };
  }
  if (RESERVED_USERNAMES.has(handle)) {
    return { valid: false, reason: "reserved" };
  }

  return { valid: true, handle, display };
}
