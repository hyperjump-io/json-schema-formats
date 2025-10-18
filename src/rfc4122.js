const hexDigit = `[0-9a-fA-F]`;
const hexOctet = `(?:${hexDigit}{2})`;
const timeLow = `${hexOctet}{4}`;
const timeMid = `${hexOctet}{2}`;
const timeHighAndVersion = `${hexOctet}{2}`;
const clockSeqAndReserved = hexOctet;
const clockSeqLow = hexOctet;
const node = `${hexOctet}{6}`;

const uuid = `${timeLow}\\-${timeMid}\\-${timeHighAndVersion}\\-${clockSeqAndReserved}${clockSeqLow}\\-${node}`;

/**
 * The 'uuid' format. Validates that a string represents a UUID address as
 * defined by [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isUuid = RegExp.prototype.test.bind(new RegExp(`^${uuid}$`));
