// Language: JavaScript
// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // ← 다크 모드 class 전략
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: { extend: {} },
    plugins: [],
}