import { createTheme as createMuiTheme, ThemeOptions } from '@mui/material/styles';
import { createPalette } from './create-palette';
import { createShadows } from './create-shadows';
import { createTypography } from './create-typography';

export function createTheme(): ThemeOptions {
  const palette = createPalette();
  const shadows = createShadows();
  const typography = createTypography();

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1440
      }
    },
    components: {
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none'
          },
          sizeSmall: {
            padding: '6px 16px'
          },
          sizeMedium: {
            padding: '8px 20px'
          },
          sizeLarge: {
            padding: '11px 24px'
          },
          textSizeSmall: {
            padding: '7px 12px'
          },
          textSizeMedium: {
            padding: '9px 16px'
          },
          textSizeLarge: {
            padding: '12px 16px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            padding: '32px 24px'
          }
        }
      },
      MuiCardHeader: {
        defaultProps: {
          titleTypographyProps: {
            variant: 'h6'
          },
          subheaderTypographyProps: {
            variant: 'body2'
          }
        },
        styleOverrides: {
          root: {
            padding: '32px 24px 16px'
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box'
          },
          html: {
            MozOsxFontSmoothing: 'grayscale',
            WebkitFontSmoothing: 'antialiased',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%'
          },
          body: {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%'
          },
          '#root': {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            height: '100%',
            width: '100%'
          },
          '#nprogress': {
            pointerEvents: 'none'
          },
          '#nprogress .bar': {
            backgroundColor: (palette.primary as { main: string }).main,
            height: 3,
            left: 0,
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 2000
          }
        }
      }
    },
    palette,
    shadows,
    shape: {
      borderRadius: 8
    },
    typography
  });
} 