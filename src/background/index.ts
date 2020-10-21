import './onInstall';
import './manageTablock';
import './retitle';
import { injectTitle } from './injectedScripts';

import { getContextMenuOption } from '../shared/storageHandler';

import { createContextMenu } from 'src/shared/utils';

// Simple context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.executeScript({
    code: `const tempTitle = prompt("Enter a temporary title"); \
       ${injectTitle.toString()}; injectTitle(tempTitle, 'onetime');`,
  });
});

// Add context menu if option is set
getContextMenuOption((enableContextMenu) => {
  if (enableContextMenu) {
    createContextMenu();
  }
});
