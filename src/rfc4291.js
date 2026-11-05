import { abnf } from "@hyperjump/abnf";
import { ipv4Rules } from "./rfc2673.js";

/**
 * @import * as API from "./index.d.ts"
 */

// RFC 3986, section 3.2.2. It references IPv4address from ipv4Rules.
export const ipv6Rules = `
  IPv6address =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

  h16         = 1*4HEXDIG
  ls32        = ( h16 ":" h16 ) / IPv4address
`;

/**
 * @type API.isIPv6
 * @function
 */
export const isIPv6 = RegExp.prototype.test.bind(abnf()`IPv6address ${ipv6Rules} ${ipv4Rules}`);
