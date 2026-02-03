/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#3B82F6', // Emergency Blue
                    600: '#2563EB',
                    700: '#0369a1',
                    900: '#0c4a6e',
                },
                crisis: {
                    main: '#0B0F14',
                    surface: '#111827',
                    surface2: '#1F2937',
                    border: '#2A3441',
                    text: '#E5E7EB',
                    textsec: '#9CA3AF',
                    accent: '#3B82F6',
                    cyan: '#22D3EE'
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626',
                }
            }
        },
    },
    plugins: [],
}
