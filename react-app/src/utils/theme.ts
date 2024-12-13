export const theme = {
  colors: {
    primary: {
      50: '#fff9e6',  // Lightest yellow
      100: '#fff3cc',
      200: '#ffe799',
      300: '#ffdb66',
      400: '#ffcf33',
      500: '#ffd700',  // DocBlitz yellow
      600: '#ccac00',
      700: '#998100',
      800: '#665600',
      900: '#332b00'   // Darkest yellow
    },
    // Complementary colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    // Semantic colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  },
  // Component-specific tokens
  components: {
    button: {
      primary: {
        bg: '#ffd700',
        hover: '#ffcf33',
        active: '#ccac00',
        text: '#332b00',
        border: '#ffdb66'
      },
      secondary: {
        bg: '#fff9e6',
        hover: '#fff3cc',
        active: '#ffe799',
        text: '#665600',
        border: '#ffdb66'
      },
      danger: {
        bg: '#ef4444',
        hover: '#dc2626',
        active: '#b91c1c',
        text: '#ffffff',
        border: '#fca5a5'
      }
    },
    input: {
      bg: '#ffffff',
      border: '#d1d5db',
      hover: '#ffdb66',
      focus: {
        border: '#ffd700',
        ring: '#fff3cc'
      },
      placeholder: '#9ca3af',
      text: '#111827'
    },
    modal: {
      overlay: 'rgba(0, 0, 0, 0.5)',
      bg: '#ffffff',
      header: {
        bg: '#fff9e6',
        text: '#332b00'
      },
      footer: {
        bg: '#fff9e6'
      }
    },
    dropdown: {
      bg: '#ffffff',
      hover: '#fff9e6',
      selected: {
        bg: '#fff3cc',
        text: '#665600'
      },
      border: '#ffdb66'
    },
    tabs: {
      inactive: {
        text: '#6b7280',
        hover: {
          text: '#665600',
          border: '#ffdb66'
        }
      },
      active: {
        text: '#332b00',
        bg: '#fff9e6',
        border: '#ffd700'
      }
    },
    card: {
      bg: '#ffffff',
      border: '#e5e7eb',
      hover: {
        border: '#ffdb66',
        shadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    },
    badge: {
      primary: {
        bg: '#fff9e6',
        text: '#665600',
        border: '#ffdb66'
      },
      success: {
        bg: '#ecfdf5',
        text: '#065f46',
        border: '#6ee7b7'
      },
      error: {
        bg: '#fef2f2',
        text: '#991b1b',
        border: '#fca5a5'
      },
      warning: {
        bg: '#fffbeb',
        text: '#92400e',
        border: '#fcd34d'
      },
      info: {
        bg: '#eff6ff',
        text: '#1e40af',
        border: '#93c5fd'
      }
    }
  },
  // Common UI states
  states: {
    hover: {
      primary: '#ffe033',
      gray: '#f3f4f6',
      transition: 'all 150ms ease-in-out'
    },
    focus: {
      ring: '#ffd700',
      border: '#ffdb66',
      outline: 'none',
      transition: 'all 150ms ease-in-out'
    },
    active: {
      primary: '#ffcf33',
      gray: '#e5e7eb',
      scale: '0.98'
    },
    disabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  },
  // Typography
  typography: {
    fonts: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  // Spacing and Layout
  layout: {
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  }
}; 