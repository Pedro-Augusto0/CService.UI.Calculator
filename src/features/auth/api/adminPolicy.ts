/**
 * E-mails que recebem isAdmin = true ao cadastrar (definição interna; sem UI).
 * Configure em `.env`: VITE_AUTH_ADMIN_EMAILS=admin@empresa.com,outro@empresa.com
 */
function adminEmailAllowlist(): Set<string> {
  const raw = import.meta.env.VITE_AUTH_ADMIN_EMAILS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function resolveIsAdminForNewUser(email: string): boolean {
  return adminEmailAllowlist().has(email.trim().toLowerCase())
}
