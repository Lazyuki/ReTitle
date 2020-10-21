import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/compat';
import Switch from '@material-ui/core/Switch';
import { createContextMenu } from 'src/shared/utils';

const ContextMenuSwitch = () => {
  const [contextMenu, setContextMenu] = useState(false);

  useEffect(() => {
    if (contextMenu) {
    }
  }, [contextMenu]);

  const toggleContextMenu = () => {
    if (contextMenu) {
      chrome.contextMenus.removeAll();
    } else {
      createContextMenu();
    }
    setContextMenu(!contextMenu);
  };

  return (
    <Switch
      name="contextMenuSwitch"
      checked={contextMenu}
      onChange={toggleContextMenu}
    />
  );
};

export default ContextMenuSwitch;
