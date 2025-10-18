/**
 * The 'regex' format. Validates that a string represents a regular expression
 * as defined by [ECMA-262](https://262.ecma-international.org/5.1/).
 *
 * @see [JSON Schema Core, section 7.3.8](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.8)
 *
 * @param {string} regex
 * @returns {boolean}
 */
export const isRegex = (regex) => {
  try {
    new RegExp(regex, "u");
    return true;
  } catch (_error) {
    return false;
  }
};
