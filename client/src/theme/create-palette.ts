import { PaletteOptions } from '@mui/material';
import { amber, blue, green, indigo, neutral, purple, red } from './colors';

interface ExtendedPaletteOptions extends PaletteOptions {
  neutral: {
    [key: string]: string;
  };
}

export const createPalette = (): ExtendedPaletteOptions => {
  return {
    action: {
      active: neutral[500],
      disabled: neutral[200],
      disabledBackground: neutral[100],
      focus: neutral[300],
      hover: neutral[100],
      selected: neutral[200]
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF'
    },
    divider: neutral[200],
    error: {
      contrastText: '#FFFFFF',
      main: red[500]
    },
    info: {
      contrastText: '#FFFFFF',
      main: blue[500]
    },
    mode: 'light',
    neutral,
    primary: {
      contrastText: '#FFFFFF',
      main: indigo[600]
    },
    secondary: {
      contrastText: '#FFFFFF',
      main: purple[600]
    },
    success: {
      contrastText: '#FFFFFF',
      main: green[600]
    },
    text: {
      disabled: neutral[400],
      primary: neutral[900],
      secondary: neutral[500]
    },
    warning: {
      contrastText: '#FFFFFF',
      main: amber[600]
    }
  };
}; 