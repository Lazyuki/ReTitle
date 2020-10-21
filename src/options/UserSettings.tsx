import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/compat';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

import ContextMenuSwitch from './ContextMenuSwitch';
import KeyboardShortcutSettings from './KeyboardShortcutSettings';
import { TabOption } from '../shared/types';
import {
  getDefaultOption,
  setDefaultOption,
  setTheme,
  getTheme,
} from '../shared/storageHandler';

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: '0.8em',
    borderTop: `1px solid ${theme.palette.primary.main}`,
  },
  label: {
    margin: '0 12px 0 16px',
    fontWeight: 600,
  },
  radios: {
    margin: '10px 0',
    paddingLeft: '20px',
  },
  button: {
    textAlign: 'center',
  },
  saved: {
    opacity: 0,
    zIndex: -1,
    position: 'absolute',
    marginTop: '4px',
    marginLeft: '-20px',
    display: 'inline-block',
    transition: '0.2s',
    '&[data-shown="true"]': {
      opacity: 1,
      marginLeft: '10px',
    },
  },
  check: {
    verticalAlign: 'middle',
    color: theme.palette.success.main,
  },
}));

const UserSettings = () => {
  const styles = useStyles();
  const [option, setOption] = useState<TabOption>('onetime');
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') !== 'light'
  );

  useEffect(() => {
    getDefaultOption().then(setDefaultOption);
    getTheme().then((theme) => setIsDark(theme === 'dark'));
  }, []);

  const handleOptionChange = useCallback((e: any) => {
    const newOption: TabOption = e.target.value;
    setOption(newOption);
    setDefaultOption(newOption);
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
    setIsDark(!isDark);
  };

  return (
    <div>
      <div>
        {/* Popup flickers when using light theme, so stick to dark theme until I figure out a workaround */}
        <FormControlLabel
          control={
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              name="isDarkTheme"
            />
          }
          labelPlacement="start"
          label={<label className={styles.label}>Dark Theme:</label>}
        />
        <div>
          <label className={styles.label}>Keyboard Shortcut:</label>
          <KeyboardShortcutSettings />
        </div>
        <div>
          <label className={styles.label}>Add ReTitle to context menu</label>
          <ContextMenuSwitch />
        </div>
      </div>
      <label className={styles.label}>Default Option:</label>
      <p>
        This option will be used as the default value in the extension popup
        menu. These options are in the order of priority, so for example{' '}
        <code>Set for this tab</code> will be matched instead of
        <code>Only exact match</code> if the given tab matches both.
      </p>
      <FormControl className={styles.radios} component="fieldset">
        <RadioGroup
          aria-label="option"
          name="option"
          value={option}
          onChange={handleOptionChange}
        >
          <FormControlLabel
            value="onetime"
            control={<Radio color="primary" />}
            label={
              <div>
                <code>Set it temporarily</code>
                Temporarily sets the title just once which does not persist at
                all. Reloading or changing the URL loses the changed title.
              </div>
            }
          />
          <FormControlLabel
            value="tablock"
            control={<Radio color="primary" />}
            label={
              <div>
                <code>Set for this tab</code>
                This will match the current tab no matter the URL, but will be
                lost once the tab is closed. This will persist if you close the
                window and reopen it with previous tabs. However, if the browser
                crashes or the window didn't load the tabs on startup then this
                settings will be lost.
              </div>
            }
          />
          <FormControlLabel
            value="exact"
            control={<Radio color="primary" />}
            label={
              <div>
                <code>Set for this exact URL</code>
                This will match the URL exactly and it will be persistent across
                sessions. You can set this to ignore URL parameters such as{' '}
                <code>#</code>, <code>&amp;</code>, and <code>?</code> to be
                ignored in the saved titles page.
              </div>
            }
          />
          <FormControlLabel
            value="domain"
            control={<Radio color="primary" />}
            label={
              <div>
                <code>Set for this domain</code>
                This will match the domain part of the URL and it will be
                persistent across sessions.
              </div>
            }
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export default UserSettings;
