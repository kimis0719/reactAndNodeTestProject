// Language: TypeScript JSX
// client/src/components/ThemeToggle.tsx
import { useEffect, useState } from 'react'
import { setTheme } from '../theme'

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'))
    }, [])

    const handleToggle = () => {
        const next = isDark ? 'light' : 'dark'
        setTheme(next)
        setIsDark(!isDark)
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
        >
            <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
            <span>{isDark ? '다크' : '라이트'}</span>
        </button>
    )
}