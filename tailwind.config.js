const colors = require('tailwindcss/colors');
const { theme } = require('./src/utils/theme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        docblitz: theme.colors.primary,
        success: theme.colors.success,
        error: theme.colors.error,
        warning: theme.colors.warning,
        info: theme.colors.info,
      },
      backgroundColor: {
        'docblitz': {
          light: theme.colors.primary[50],
          DEFAULT: theme.colors.primary[500],
          dark: theme.colors.primary[600],
        },
        modal: {
          overlay: theme.components.modal.overlay,
          header: theme.components.modal.header.bg,
          footer: theme.components.modal.footer.bg,
        },
        dropdown: {
          DEFAULT: theme.components.dropdown.bg,
          hover: theme.components.dropdown.hover,
          selected: theme.components.dropdown.selected.bg,
        },
      },
      textColor: {
        'docblitz': {
          light: theme.colors.primary[600],
          DEFAULT: theme.colors.primary[700],
          dark: theme.colors.primary[800],
        },
      },
      borderColor: {
        'docblitz': {
          light: theme.colors.primary[300],
          DEFAULT: theme.colors.primary[500],
          dark: theme.colors.primary[600],
        },
      },
      ringColor: {
        'docblitz': theme.colors.primary[500],
      },
      ringWidth: {
        DEFAULT: '1px',
        0: '0px',
        1: '1px',
        2: '2px',
        4: '4px',
      },
      fontSize: theme.typography.sizes,
      fontFamily: theme.typography.fonts,
      fontWeight: theme.typography.weights,
      spacing: theme.layout.spacing,
      borderRadius: theme.layout.borderRadius,
      boxShadow: theme.layout.shadows,
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'fade-out': 'fadeOut 200ms ease-in-out',
        'slide-in': 'slideIn 200ms ease-in-out',
        'slide-out': 'slideOut 200ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      ringColor: ['focus-visible'],
      ringWidth: ['focus-visible'],
      scale: ['active'],
    },
  },
}; 