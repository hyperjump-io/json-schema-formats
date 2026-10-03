import { isIdnHostname } from "idn-hostname";
import { isHostname } from "./rfc1123.js";

/**
 * @import * as API from "./index.d.ts"
 */

/** @type API.isAsciiIdn */
export const isAsciiIdn = (hostname) => {
  return isHostname(hostname) && isIdn(hostname);
};

/** @type API.isIdn */
export const isIdn = (hostname) => {
  const endsWithSeparator = /[\x2E\uFF0E\u3002\uFF61]$/.test(hostname);
  if (endsWithSeparator) {
    return false;
  }

  try {
    return isIdnHostname(hostname);
  } catch {
    return false;
  }
};
