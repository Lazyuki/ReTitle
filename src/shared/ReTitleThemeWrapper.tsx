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
  props: {
    MuiButtonBase: {
      disableRipple: true,
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
      main: '#47bfff',
    },
    secondary: {
      main: '#ffaf47',
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
  const [theme, setTheme] = useState<ThemeState>(
    // Using localStorage as cache since it is way faster than using the storage API
    (localStorage.getItem('theme') as ThemeState) || 'dark'
  );
  globalStyles();

  useEffect(() => {
    chrome.storage.sync.get(KEY_THEME, (items) => {
      const storedTheme = items[KEY_THEME];
      if (storedTheme) {
        setTheme(storedTheme);
        localStorage.setItem('theme', storedTheme);
      }
    });
  }, []);

  const storageChangeHandler = useCallback((changes: StorageChanges) => {
    if (changes[KEY_THEME]) {
      const newTheme = changes[KEY_THEME].newValue;
      if (newTheme) {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
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
