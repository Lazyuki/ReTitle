import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import Button from '@material-ui/core/Button';

const KEYBOARD_SHORTCUT_NAME = '_execute_browser_action';
const defaultShortcut = 'Alt+Shift+X';
const isChrome = BROWSER === 'chrome';
const linkURL = isChrome
  ? 'chrome://extensions/shortcuts'
  : 'https://support.mozilla.org/en-US/kb/manage-extension-shortcuts-firefox';

const KeyboardShortcutSettings = () => {
  const [shortcut, setShortcut] = useState(defaultShortcut);

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      for (const command of commands) {
        if (command.name === KEYBOARD_SHORTCUT_NAME && command.shortcut) {
          setShortcut(command.shortcut);
        }
      }
    });
  }, []);

  return (
    <span>
      {shortcut}
      <Button
        style={{ marginLeft: '20px' }}
        variant="outlined"
        size="small"
        color="primary"
        onClick={() => chrome.tabs.create({ url: linkURL })}
        endIcon={<KeyboardIcon />}
      >
        Manage
      </Button>
    </span>
  );
};

export default KeyboardShortcutSettings;
