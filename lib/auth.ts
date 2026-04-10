// This is a simple auth utility for the demo
// In production, use proper authentication mechanisms

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isAuthenticated') === 'true';
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('username');
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('username');
}
