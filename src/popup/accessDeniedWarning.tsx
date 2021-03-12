import { h, JSX } from 'preact';

const isChrome = BROWSER === 'chrome';

// Taken from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
const FF_BLOCKED_SITES = [
  'accounts-static.cdn.mozilla.net',
  'accounts.firefox.com',
  'addons.cdn.mozilla.net',
  'addons.mozilla.org',
  'api.accounts.firefox.com',
  'content.cdn.mozilla.net',
  'content.cdn.mozilla.net',
  'discovery.addons.mozilla.org',
  'input.mozilla.org',
  'install.mozilla.org',
  'oauth.accounts.firefox.com',
  'profile.accounts.firefox.com',
  'support.mozilla.org',
  'sync.services.mozilla.com',
  'testpilot.firefox.com',
];

export default function accessDeniedWarning(domain: string, url?: string) {
  if (isChrome) {
    if (url && /^(chrome|chrome-extension):/.test(url)) {
      return 'Extensions are disabled on browser internal URLs';
    }
  } else {
    if (url) {
      if (url.startsWith('file:///')) {
        return (
          <div>
            Local files cannot be accessed by add-ons on Firefox for{' '}
            <a
              href="https://bugzilla.mozilla.org/show_bug.cgi?id=1454760"
              target="_blank"
            >
              security reasons
            </a>
            . You can still use this extension with local files on Google
            Chrome.
          </div>
        );
      }
    }
    if (url && /^(about|moz-extension):/.test(url)) {
      return 'Add-ons are disabled on browser internal URLs';
    }
    if (FF_BLOCKED_SITES.includes(domain)) {
      return (
        <div>
          Firefox add-ons cannot access
          <br />
          <code>{domain}</code>
          <br />
          websites.{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts"
            target="_blank"
          >
            Details
          </a>
        </div>
      );
    }
  }
  return null;
}
