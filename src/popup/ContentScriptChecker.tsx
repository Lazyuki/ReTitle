import { h } from 'preact';
import { useState, useEffect, FC } from 'preact/compat';
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

const ContentScriptChecker: FC<{
  domain: string;
  url?: string;
  className: string;
}> = ({ domain, url, className, children }) => {
  const [isAllowed, setIsAllowed] = useState(true);
  useEffect(() => {
    browser.tabs.executeScript({ code: '' }).catch(() => {
      setIsAllowed(false);
    });
  }, []);
  if (isChrome) {
    if (url && /^(chrome|chrome-extension):/.test(url)) {
      return (
        <div className={className}>
          Extensions are disabled on browser internal URLs
        </div>
      );
    }
  } else {
    if (url) {
      if (/^(about|moz-extension):/.test(url)) {
        return (
          <div className={className}>
            Add-ons are disabled on browser internal URLs
          </div>
        );
      }
      if (!isAllowed) {
        const sanitizedURL = url.split('?')[0].split('#')[0];
        if (/(\.json|\.pdf)$/i.test(sanitizedURL)) {
          return (
            <div className={className}>
              PDFs and JSON files cannot be accessed by add-ons on Firefox for{' '}
              <a
                href="https://bugzilla.mozilla.org/show_bug.cgi?id=1454760"
                target="_blank"
              >
                security reasons
              </a>
              . You can still use this extension with those files on Google
              Chrome.
            </div>
          );
        } else if (FF_BLOCKED_SITES.includes(domain)) {
          return (
            <div className={className}>
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
        } else {
          return (
            <div className={className}>
              This extension does not work on this page
            </div>
          );
        }
      }
    }
  }
  return <div>{children}</div>;
};

export default ContentScriptChecker;
