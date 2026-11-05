import { abnf } from "@hyperjump/abnf";

/**
 * @import * as API from "./index.d.ts"
 */

const domainPattern = abnf()`
  hostname    = label *( "." label )
  label       = let-dig [ *61let-dig-hyp let-dig ] ; 1-63 characters
  let-dig     = ALPHA / DIGIT
  let-dig-hyp = let-dig / "-"
`;

/** @type API.isHostname */
export const isHostname = (hostname) => {
  return hostname.length < 256 && domainPattern.test(hostname);
};
