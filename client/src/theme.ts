// Language: TypeScript
// client/src/theme.ts
const STORAGE_KEY = 'theme' as const
type Theme = 'light' | 'dark'

export function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
}

export function getStoredTheme(): Theme | null {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'dark' || v === 'light' ? v : null
}

export function getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

export function setTheme(theme: Theme) {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
}

export function toggleTheme() {
    const current = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
    setTheme(current === 'dark' ? 'light' : 'dark')
}

export function initTheme() {
    const stored = getStoredTheme()
    const initial = stored ?? getSystemTheme()
    applyTheme(initial)

    // 사용자가 저장한 값이 없을 때만 시스템 변경을 반영
    if (!stored) {
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => applyTheme(media.matches ? 'dark' : 'light')
        media.addEventListener('change', handler)
    }
}