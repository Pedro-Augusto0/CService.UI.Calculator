/** Valor interno atribuído no cadastro; não coletado nem exibido na UI. */
export function createInternalRegistrationField(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `int_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
