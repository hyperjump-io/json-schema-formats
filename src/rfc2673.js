const decOctet = `(?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])`;
const ipV4Address = `${decOctet}\\.${decOctet}\\.${decOctet}\\.${decOctet}`;

/**
 * The 'ipv4' format. Validates that a string represents an IPv4 address
 * according to the "dotted-quad" ABNF syntax as defined in
 * [RFC 2673, section 3.2](https://www.rfc-editor.org/rfc/rfc2673.html#section-3.2).
 *
 * @see [JSON Schema Core, section 7.3.4](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.4)
 *
 * @function
 */
export const isIPv4 = RegExp.prototype.test.bind(new RegExp(`^${ipV4Address}$`));
