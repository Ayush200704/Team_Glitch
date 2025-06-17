// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"], // adapt to your project
    theme: {
        extend: {
            keyframes: {
                floatUp: {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(-100px)', opacity: '0' },
                },
            },
            animation: {
                floatUp: 'floatUp 2s ease-out forwards',
            },
        },
    },
    plugins: [],
};
