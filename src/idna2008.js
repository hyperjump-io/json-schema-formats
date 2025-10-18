import tr46 from "tr46";

const label = `[A-Za-z0-9-]{1,63}`;
const domain = `${label}(?:\\.${label})*`;

const domainPattern = new RegExp(`^${domain}$`);

const parserOptions = {
  checkBidi: true,
  checkJoiners: true,
  checkHyphens: true
};

/**
 * The 'hostname' format since draft-07. Validates that a string represents an
 * IDNA2008 internationalized domain name consiting of only A-labels and NR-LDH
 * labels as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.3).
 *
 * **NOTE**: The 'hostname' format changed in draft-07. Use {@link isHostname}
 * for draft-06 and earlier.
 *
 * **WARNING**: This function can't completely validate IDNA2008 hostnames. See
 * {@link !"IDNA2008 Limitations" | IDNA2008 Limitations} for details.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export const isAsciiIdn = (hostname) => {
  return domainPattern.test(hostname)
    && hostname.length < 256
    && !tr46.toUnicode(hostname, parserOptions).error;
};

/**
 * The 'idn-hostname' format. Validates that a string represents an IDNA2008
 * internationalized domain name as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.1).
 *
 * **WARNING**: This function can't completely validate IDNA2008 hostnames. See
 * {@link !"IDNA2008 Limitations" | IDNA2008 Limitations} for details.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export const isIdn = (hostname) => {
  const asciiHostname = tr46.toASCII(hostname);

  if (!asciiHostname) {
    return false;
  }

  return isAsciiIdn(asciiHostname);
};
