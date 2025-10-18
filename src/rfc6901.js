const unescaped = `[\\u{00}-\\u{2E}\\u{30}-\\u{7D}\\u{7F}-\\u{10FFFF}]`; // %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
const escaped = `~[01]`; // representing '~' and '/', respectively
const referenceToken = `(?:${unescaped}|${escaped})*`;
const jsonPointer = `(?:/${referenceToken})*`;

/**
 * The 'json-pointer' format. Validates that a string represents a JSON Pointer
 * as defined by [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901.html).
 *
 * @see [JSON Schema Core, section 7.3.7](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.7)
 *
 * @function
 */
export const isJsonPointer = RegExp.prototype.test.bind(new RegExp(`^${jsonPointer}$`, "u"));
