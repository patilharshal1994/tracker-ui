import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

const ThemeContext = createContext(null);

// Color schemes - Only 2 best themes
const colorSchemes = {
  salla: {
    primary: { main: '#005DAE', light: '#006FCC', dark: '#004A8C' }, // Salla Primary Blue
    secondary: { main: '#FFD500', light: '#FFE033', dark: '#E6C000' }, // Salla Yellow/Gold
    info: { main: '#005DAE', light: '#006FCC', dark: '#004A8C' }, // Salla Blue
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
    error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' }
  },
  tiktok: {
    primary: { main: '#FE2C55', light: '#FF5C7A', dark: '#D91E3F' }, // TikTok Razzmatazz (Pink/Red)
    secondary: { main: '#25F4EE', light: '#4DF5EE', dark: '#1BC4BE' }, // TikTok Splash (Cyan)
    info: { main: '#25F4EE', light: '#4DF5EE', dark: '#1BC4BE' }, // TikTok Cyan
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
    error: { main: '#FE2C55', light: '#FF5C7A', dark: '#D91E3F' } // Use TikTok pink for errors
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });
  
  const [colorScheme, setColorScheme] = useState(() => {
    const saved = localStorage.getItem('themeColorScheme');
    // Validate that the saved scheme exists in colorSchemes
    if (saved && colorSchemes[saved]) {
      return saved;
    }
    return 'salla';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    // Validate colorScheme before saving
    if (colorSchemes[colorScheme]) {
      localStorage.setItem('themeColorScheme', colorScheme);
    } else {
      // If invalid, reset to 'salla' and update state
      setColorScheme('salla');
      localStorage.setItem('themeColorScheme', 'salla');
    }
  }, [colorScheme]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    // Ensure colorScheme is valid, fallback to 'salla' if not
    const validColorScheme = colorSchemes[colorScheme] ? colorScheme : 'salla';
    const colors = colorSchemes[validColorScheme];
    
    return createTheme({
      palette: {
        mode,
        primary: colors.primary,
        secondary: colors.secondary,
        info: colors.info,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        ...(mode === 'dark' && {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
        ...(mode === 'light' && {
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }),
      },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              ...(mode === 'dark' && {
                backgroundColor: '#1e1e1e',
              }),
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              ...(mode === 'dark' && {
                backgroundColor: '#2d2d2d',
              }),
              ...(mode === 'light' && {
                backgroundColor: '#f5f5f5',
              }),
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              ...(mode === 'dark' && {
                '&.MuiChip-colorDefault': {
                  backgroundColor: '#424242',
                  color: '#fff',
                },
              }),
            },
          },
        },
      },
    });
  }, [mode, colorScheme]);

  return (
    <ThemeContext.Provider value={{ mode, colorScheme, toggleMode, setColorScheme, colorSchemes: Object.keys(colorSchemes) }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
