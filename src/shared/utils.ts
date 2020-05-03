// Unique storage keys for options
export const KEY_DEFAULT_TAB_OPTION = 'OptDefault';
export const KEY_THEME = 'OptTheme';

// Title matcher prefixes
export const PREFIX_ONETIME = 'Temp#'; // Temp#5:http://example.com/page/1
export const PREFIX_TABLOCK = 'Tab#'; // Tab#13:http://example.com/page/1
export const PREFIX_EXACT = 'Exact:'; // Exact:http://example.com/page/1
export const PREFIX_DOMAIN = 'Domain:'; // Domain:www.example.com
export const PREFIX_REGEX = 'Regex:'; // Regex:^exampl.*\.com

// Regex
export const REGEX_FULL_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/)/; // http://some.example.com/ => some.example.com
export const VALID_REGEX = /^\/((?:[^/]|\\\/)+)\/((?:[^/]|\\\/)+)\/(gi?|ig?)?$/;

export function extractDomain(url?: string) {
  if (url) {
    const domain = REGEX_FULL_DOMAIN.exec(url);
    if (domain) {
      return domain[1];
    }
  }
  return '';
}
