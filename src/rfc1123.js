const label = `(?!-)[A-Za-z0-9-]{1,63}(?<!-)`;
const domain = `${label}(?:\\.${label})*`;

const domainPattern = new RegExp(`^${domain}$`);

/**
 * The 'hostname' format in draft-04 - draft-06. Validates that a string
 * represents a hostname as defined by [RFC 1123, section 2.1](https://www.rfc-editor.org/rfc/rfc1123.html#section-2.1).
 *
 * **NOTE**: The 'hostname' format changed in draft-07. Use {@link isAsciiIdn} for
 * draft-07 and later.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export const isHostname = (hostname) => {
  return domainPattern.test(hostname) && hostname.length < 256;
};
