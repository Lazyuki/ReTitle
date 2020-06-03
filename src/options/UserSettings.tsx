import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/compat';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import KeyboardShortcutSettings from './KeyboardShortcutSettings';
import { TabOption } from '../shared/types';
import { getDefaultOption, setDefaultOption } from '../shared/StorageHandler';

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

  useEffect(() => {
    getDefaultOption(setOption);
  }, []);

  const handleOptionChange = useCallback((e: any) => {
    const newOption: TabOption = e.target.value;
    setOption(newOption);
    setDefaultOption(newOption);
  }, []);

  return (
    <div>
      <div>
        {/* Popup flickers when using light theme, so stick to dark theme until I figure out a workaround */}
        {/* <FormControlLabel
          control={
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              name="isDarkTheme"
            />
          }
          labelPlacement="start" 
          label="Dark Theme:"
        /> */}
        <div>
          <label className={styles.label}>Keyboard Shortcut:</label>
          <KeyboardShortcutSettings />
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
                Temporarily sets the title, so it does not persist at all.
                Reloading or changing the URL loses the changed title.
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
                lost once the tab is closed. Note that if your browser is
                restarted, this will be lost.
              </div>
            }
          />
          <FormControlLabel
            value="exact"
            control={<Radio color="primary" />}
            label={
              <div>
                <code>Set for this exact URL</code>
                This will match the URL and it will be persistent across
                sessions.
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
