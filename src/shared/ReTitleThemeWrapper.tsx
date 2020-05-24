import { h } from 'preact';
import { FC, useState, useMemo, useEffect, useCallback } from 'preact/compat';
import {
  createMuiTheme,
  MuiThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { StorageChanges, ThemeState } from './types';
import { KEY_THEME } from './utils';

const StyleFix = {
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: '14px',
      },
      tooltipPlacementBottom: {
        margin: '10px',
      },
    },
  },
};

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#688fe6',
    },
    secondary: {
      main: '#ec4fc4',
    },
  },
  ...StyleFix,
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#9ab0e6',
    },
    secondary: {
      main: '#ec4fc4',
    },
  },
  ...StyleFix,
});

const globalStyles = makeStyles({
  '@global': {
    code: {
      display: 'inline-block',
      padding: '2px 5px',
      borderRadius: '5px',
      color: 'white',
      background: '#232323',
      margin: '0 3px',
      fontFamily: '"Menlo", "Lucida Console", monospace',
      fontSize: '0.8em',
    },
  },
});

const ReTitleThemeWrapper: FC = ({ children }) => {
  const [theme, setTheme] = useState<ThemeState>('dark');
  globalStyles();

  useEffect(() => {
    chrome.storage.sync.get(KEY_THEME, (items) => {
      if (items[KEY_THEME]) {
        setTheme(items[KEY_THEME]);
      }
    });
  }, []);

  const storageChangeHandler = useCallback((changes: StorageChanges) => {
    if (changes[KEY_THEME]) {
      const change = changes[KEY_THEME];
      if (change.newValue) {
        setTheme(change.newValue);
      }
    }
  }, []);

  useEffect(() => {
    chrome.storage.onChanged.addListener(storageChangeHandler);
    return () => chrome.storage.onChanged.removeListener(storageChangeHandler);
  }, [storageChangeHandler]);
  return (
    <MuiThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ReTitleThemeWrapper;
