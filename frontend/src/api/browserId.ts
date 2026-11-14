/**
 * Anonymous Browser ID generator & persistent storage.
 * Ensures student sessions are isolated without requiring authentication.
 */

const STORAGE_KEY = 'astra_student_browser_id';

export function getOrCreateBrowserId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || id.trim() === '') {
      id = 'student_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'student_ephemeral_fallback';
  }
}
