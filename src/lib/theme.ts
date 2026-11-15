export type Theme = 'dark' | 'light'

const KEY = 'canrank.theme'

/** Dark unless the user explicitly picked light. */
export function getTheme(): Theme {
  return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(t: Theme = getTheme()) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0e1013' : '#f4f5f7')
}

export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t)
  applyTheme(t)
}
