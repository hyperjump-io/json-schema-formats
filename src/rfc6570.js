import { abnf } from "@hyperjump/abnf";
import { FormatError, invalidCharacter, isProblem, matchEnd, missing, problem, sticky } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

const uriTemplateRules = `
  URI-Template    = *( literals / expression )

  literals        = %x21 / %x23-24 / %x26-3B / %x3D / %x3F-5B
                  / %x5D / %x5F / %x61-7A / %x7E / ucschar / iprivate
                  / pct-encoded
                       ; any Unicode character except: CTL, SP,
                       ;  DQUOTE, "%" (aside from pct-encoded),
                       ;  "<", ">", "\\", "^", "\`", "{", "|", "}"

  expression      = "{" [ operator ] variable-list "}"
  operator        = op-level2 / op-level3 / op-reserve
  op-level2       = "+" / "#"
  op-level3       = "." / "/" / ";" / "?" / "&"
  op-reserve      = "=" / "," / "!" / "@" / "|"

  variable-list   = varspec *( "," varspec )
  varspec         = varname [ modifier-level4 ]
  varname         = varchar *( ["."] varchar )
  varchar         = ALPHA / DIGIT / "_" / pct-encoded

  modifier-level4 = prefix / explode
  prefix          = ":" max-length
  max-length      = %x31-39 0*3DIGIT ; positive integer < 10000
  explode         = "*"

  pct-encoded     = "%" HEXDIG HEXDIG

  ucschar         = %xA0-D7FF / %xF900-FDCF / %xFDF0-FFEF
                  / %x10000-1FFFD / %x20000-2FFFD / %x30000-3FFFD
                  / %x40000-4FFFD / %x50000-5FFFD / %x60000-6FFFD
                  / %x70000-7FFFD / %x80000-8FFFD / %x90000-9FFFD
                  / %xA0000-AFFFD / %xB0000-BFFFD / %xC0000-CFFFD
                  / %xD0000-DFFFD / %xE1000-EFFFD
  iprivate        = %xE000-F8FF / %xF0000-FFFFD / %x100000-10FFFD
`;

/**
 * @type API.isUriTemplate
 * @function
 */
export const isUriTemplate = RegExp.prototype.test.bind(abnf()`URI-Template ${uriTemplateRules}`);

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

const tag = abnf({ rules: uriTemplateRules, anchored: false });
// The literals that aren't percent-encoded
const literalChars = sticky(tag`*( literals ) pct-encoded = "%"`);
const operator = sticky(tag`operator`);
const varchars = sticky(tag`*( ALPHA / DIGIT / "_" )`);
const digits = sticky(tag`*DIGIT`);
const maxLength = abnf({ rules: uriTemplateRules })`max-length`;

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
