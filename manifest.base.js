module.exports = {
  manifest_version: 2,

  name: 'Tab ReTitle',
  short_name: 'ReTitle',
  description: 'Change tab titles easily!',
  author: 'Lazyuki',
  homepage_url: 'https://github.com/Lazyuki/ReTitle',
  browser_action: {
    default_icon: './icons/icon256.png',
    default_popup: 'popup.html',
  },
  icons: {
    16: './icons/icon16.png',
    32: './icons/icon32.png',
    64: './icons/icon64.png',
    128: './icons/icon128.png',
    256: './icons/icon256.png',
  },
  background: {
    scripts: ['background.js'],
  },
  options_ui: {
    page: 'options.html',
    chrome_style: false,
    open_in_tab: true,
  },
  commands: {
    _execute_browser_action: {
      suggested_key: {
        default: 'Alt+Shift+X',
        mac: 'Alt+Shift+X',
        linux: 'Alt+Shift+X',
      },
      description: 'Set new title',
    },
  },
  // contextMenus cannot be optional on Firefox
  // <all_urls> is needed to make sure background tabs could be retitled out of focus
  permissions: ['activeTab', 'tabs', 'storage', '<all_urls>', 'contextMenus'],
  optional_permissions: ['bookmarks'],
};
