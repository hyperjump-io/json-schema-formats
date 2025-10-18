import * as Hyperjump from "@hyperjump/uri";

/**
 * The 'iri' format. Validates that a string represents an IRI as defined by
 * [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isIri = Hyperjump.isIri;

/**
 * The 'iri-reference' format. Validates that a string represents an IRI
 * Reference as defined by [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 *
 * @function
 */
export const isIriReference = Hyperjump.isIriReference;
