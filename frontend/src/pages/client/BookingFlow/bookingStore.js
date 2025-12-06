const KEY = 'bookingDraft'

export function readDraft() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) { return {} }
}

export function writeDraft(obj) {
  try {
    const merged = { ...readDraft(), ...obj }
    sessionStorage.setItem(KEY, JSON.stringify(merged))
    return merged
  } catch (e) { return obj }
}

export function clearDraft() {
  sessionStorage.removeItem(KEY)
}
