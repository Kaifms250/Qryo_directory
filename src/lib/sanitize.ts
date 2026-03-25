import DOMPurify from "dompurify";

/** Sanitize user input - strip all HTML/script tags */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/** Rate limiter: returns true if action is allowed */
export function createRateLimiter(intervalMs: number) {
  let lastAction = 0;
  return {
    canProceed(): boolean {
      const now = Date.now();
      if (now - lastAction >= intervalMs) {
        lastAction = now;
        return true;
      }
      return false;
    },
    remainingMs(): number {
      return Math.max(0, intervalMs - (Date.now() - lastAction));
    },
  };
}
