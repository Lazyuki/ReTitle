export const REGEX_FULL_DOMAIN = /https?:\/\/([^\s/]+)(?:$|\/)/; // http://some.example.com/ => some.example.com
export const validRegex = /^\/((?:[^/]|\\\/)+)\/((?:[^/]|\\\/)+)\/(gi?|ig?)?$/;

export function extractDomain(url?: string) {
  if (url) {
    const domain = REGEX_FULL_DOMAIN.exec(url);
    if (domain) {
      return domain[1];
    }
  }
  return '';
}
