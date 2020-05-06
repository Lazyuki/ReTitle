import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/compat';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

import KeyboardShortcutSettings from './KeyboardShortcutSettings';
import { ThemeState } from '../shared/types';
import { KEY_THEME } from '../shared/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: '0.8em',
    borderTop: `1px solid ${theme.palette.primary.main}`,
  },
  label: {
    margin: '0 12px 0 16px',
  },
}));

const UserSettings = () => {
  const [isDark, setIsDark] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    chrome.storage.sync.get(KEY_THEME, function (items) {
      if (items[KEY_THEME]) {
        const theme: ThemeState = items[KEY_THEME];
        setIsDark(theme === 'dark');
      }
    });
  }, []);

  const toggleTheme = useCallback((e: any) => {
    setIsDark(e.target.checked);
    chrome.storage.sync.set({
      [KEY_THEME]: e.target.checked ? 'dark' : 'light',
    });
  }, []);

  return (
    <div>
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              name="isDarkTheme"
            />
          }
          labelPlacement="start"
          label="Dark Theme:"
        />
        <div>
          <label className={styles.label}>Keyboard Shortcut:</label>
          <KeyboardShortcutSettings />
        </div>
      </div>
      <p>
        This setting will be used as a default value in the extension pop up
        menu. These options are in the order of priority, so for example{' '}
        <code>Set for this tab</code> will be matched instead of
        <code>Only exact match</code> if the given tab matches both.
      </p>
      <form class="col s12" id="form">
        <p>
          <label for="onetime">
            <input class="with-gap" name="option" type="radio" id="onetime" />
            <span>
              <strong>Only this time</strong>: Temporarily sets the title, so
              it's not persistent at all. Reloading or changing the URL loses
              this change.
            </span>
          </label>
        </p>
        <p>
          <label for="tablock">
            <input class="with-gap" name="option" type="radio" id="tablock" />
            <span>
              <strong>Set for this tab</strong>: This will match the current tab
              no matter the URL, but will be lost once the tab is closed. Note
              that if your browser is restarted, this will be lost.
            </span>
          </label>
        </p>
        <p>
          <label for="exact">
            <input class="with-gap" name="option" type="radio" id="exact" />
            <span>
              <strong>Only exact match</strong>: This will match the URL and it
              will be persistent across sessions.
            </span>
          </label>
        </p>
        <p>
          <label for="domain">
            <input class="with-gap" name="option" type="radio" id="domain" />
            <span>
              <strong>Set for this domain</strong>: This will match the domain
              part of the URL and it will be persistent across sessions.
            </span>
          </label>
        </p>
        <div class="btn" id="save" type="submit">
          SAVE
          <i class="material-icons" id="check">
            check
          </i>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
