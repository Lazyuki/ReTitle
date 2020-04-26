import { h } from 'preact';
import { FC } from 'preact/compat';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

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
      main: '#7e57c2',
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
      main: '#7e57c2',
    },
  },
  ...StyleFix,
});

const ReTitleThemeWrapper: FC = ({ children }) => {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ReTitleThemeWrapper;
