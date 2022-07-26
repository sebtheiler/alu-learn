// Adapted from https://www.npmjs.com/package/is-url

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;

/**
 * Check if a string is a URL
 * @param string String to check if it is a URL
 * @returns Is the string a URL?
 */
export default function isUrl(string: string) {
  const match = string.match(protocolAndDomainRE);
  if (!match) return false;

  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) return false;

  return (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  );
}
