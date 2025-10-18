const unescaped = `[\\u{00}-\\u{2E}\\u{30}-\\u{7D}\\u{7F}-\\u{10FFFF}]`; // %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
const escaped = `~[01]`; // representing '~' and '/', respectively
const referenceToken = `(?:${unescaped}|${escaped})*`;
const jsonPointer = `(?:/${referenceToken})*`;

const nonNegativeInteger = `(?:0|[1-9][0-9]*)`;
const indexManipulation = `(?:[+-]${nonNegativeInteger})`;
const relativeJsonPointer = `${nonNegativeInteger}(?:${indexManipulation}?${jsonPointer}|#)`;

/**
 * The 'relative-json-pointer' format. Validates that a string represents an IRI
 * Reference as defined by [draft-bhutton-relative-json-pointer-00](https://datatracker.ietf.org/doc/html/draft-bhutton-relative-json-pointer-00).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isRelativeJsonPointer = RegExp.prototype.test.bind(new RegExp(`^${relativeJsonPointer}$`, "u"));
