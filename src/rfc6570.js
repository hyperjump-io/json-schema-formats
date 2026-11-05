import { FormatError, invalidCharacter, isProblem, matchEnd, missing, problem } from "./diagnose.js";
import { digits, literalChars, maxLength, operator, uriTemplate, varchars } from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isUriTemplate
 * @function
 */
export const isUriTemplate = RegExp.prototype.test.bind(uriTemplate);

/** @type API.assertUriTemplate */
export const assertUriTemplate = (uriTemplate) => {
  if (!isUriTemplate(uriTemplate)) {
    throw new InvalidUriTemplateError(uriTemplate, diagnoseUriTemplate(uriTemplate));
  }
};

/**
 * A value isn't a URI Template. {@link assertUriTemplate} throws it.
 *
 * @hideconstructor
 */
export class InvalidUriTemplateError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("uri-template", value, problem);
    this.name = "InvalidUriTemplateError";
  }
}

// Diagnosing

/**
 * A "%" at `start`, which has to be followed by two hex digits.
 *
 * @type (value: string, start: number, part: string) => number | Problem
 */
const pctEncoded = (value, start, part) => {
  return /^%[\da-f]{2}$/iu.test(value.slice(start, start + 3))
    ? start + 3
    : problem("invalid-percent-encoding", part, start, Math.min(start + 3, value.length), `"%" must be followed by two hex digits`);
};

/** @type (uriTemplate: string) => Problem | undefined */
const diagnoseUriTemplate = (uriTemplate) => {
  for (let position = 0; position < uriTemplate.length;) {
    const char = uriTemplate[position];
    const next = char === "{"
      ? expression(uriTemplate, position)
      : char === "%"
        ? pctEncoded(uriTemplate, position, "literals")
        : matchEnd(literalChars, uriTemplate, position);

    if (isProblem(next)) {
      return next;
    } else if (next === position) {
      return char === "}"
        ? invalidCharacter(uriTemplate, position, "literals", "outside an expression", `an expression starts with "{"`)
        : invalidCharacter(uriTemplate, position, "literals", "in a URI template");
    }
    position = next;
  }
};

/**
 * An expression at `start`, which is a "{": where it ends, or what's wrong.
 *
 * @type (value: string, start: number) => number | Problem
 */
const expression = (value, start) => {
  let position = matchEnd(operator, value, start + 1);

  for (;;) {
    const nameEnd = varname(value, position);
    if (isProblem(nameEnd)) {
      return nameEnd;
    }

    const modifierEnd = modifier(value, nameEnd);
    if (isProblem(modifierEnd)) {
      return modifierEnd;
    }
    position = modifierEnd;

    if (value[position] === "}") {
      return position + 1;
    } else if (position === value.length) {
      return missing("expression", position, `it has no "}"`);
    } else if (value[position] !== ",") {
      return invalidCharacter(value, position, "expression", "in an expression");
    }
    position++;
  }
};

/** @type (value: string, start: number) => number | Problem */
const varname = (value, start) => {
  let position = start;
  for (;;) {
    const charsEnd = matchEnd(varchars, value, position);
    if (charsEnd > position) {
      position = charsEnd;
    } else if (value[position] === "%") {
      const encodedEnd = pctEncoded(value, position, "expression");
      if (isProblem(encodedEnd)) {
        return encodedEnd;
      }
      position = encodedEnd;
    } else if (value[position] === "." && position > start) {
      if (value[position - 1] === ".") {
        return invalidCharacter(value, position, "expression", `after "."`);
      }
      position++;
    } else {
      break;
    }
  }

  if (position === start) {
    return position === value.length || value[position] === "}" || value[position] === ","
      ? missing("expression", position, "it has no variable name")
      : invalidCharacter(value, position, "expression", "in a variable name");
  } else if (value[position - 1] === ".") {
    return invalidCharacter(value, position - 1, "expression", "at the end of a variable name");
  }

  return position;
};

/** @type (value: string, start: number) => number | Problem */
const modifier = (value, start) => {
  if (value[start] === "*") {
    return start + 1;
  } else if (value[start] !== ":") {
    return start;
  }

  const lengthEnd = matchEnd(digits, value, start + 1);
  if (lengthEnd === start + 1) {
    return lengthEnd === value.length || value[lengthEnd] === "}" || value[lengthEnd] === ","
      ? missing("expression", lengthEnd, `it has no length after ":"`)
      : invalidCharacter(value, lengthEnd, "expression", `after ":"`, "it must be a length");
  } else if (!maxLength.test(value.slice(start + 1, lengthEnd))) {
    return problem("invalid-value", "expression", start + 1, lengthEnd, "the length must be 1-9999");
  }

  return lengthEnd;
};
