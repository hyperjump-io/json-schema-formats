import { isIdnHostname } from "idn-hostname";
import { isHostname } from "./rfc1123.js";

/**
 * The 'hostname' format since draft-07. Validates that a string represents an
 * IDNA2008 internationalized domain name consiting of only A-labels and NR-LDH
 * labels as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.3).
 *
 * **NOTE**: The 'hostname' format changed in draft-07. Use {@link isHostname}
 * for draft-06 and earlier.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export const isAsciiIdn = (hostname) => {
  return isHostname(hostname) && isIdn(hostname);
};

/**
 * The 'idn-hostname' format. Validates that a string represents an IDNA2008
 * internationalized domain name as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.1).
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export const isIdn = (hostname) => {
  try {
    return isIdnHostname(hostname);
  } catch (_error) {
    return false;
  }
};
