/**
 * @import * as API from "./index.d.ts"
 */

/** @type API.isRegex */
export const isRegex = (regex) => {
  try {
    new RegExp(regex, "u");
    return true;
  } catch {
    return false;
  }
};
