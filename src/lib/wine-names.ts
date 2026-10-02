export function normalizeWineName(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}
