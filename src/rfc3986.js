import * as Hyperjump from "@hyperjump/uri";

/**
 * The 'uri' format. Validates that a string represents a URI as defined by [RFC
 * 3986](https://www.rfc-editor.org/rfc/rfc3986.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isUri = Hyperjump.isUri;

/**
 * The 'uri-reference' format. Validates that a string represents a URI
 * Reference as defined by [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isUriReference = Hyperjump.isUriReference;
