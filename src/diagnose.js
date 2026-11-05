// What every format's diagnosis is made of. A diagnosis only runs after a format's pattern rejected a value, and it
// finds the first thing that's wrong: a reason, the part of the value it's in, and where.

/**
 * @typedef {{
 *   reason: string;
 *   part: string;
 *   start: number;
 *   end: number;
 *   text: string;
 *   positioned: boolean;
 *   hint: string | undefined;
 * }} Problem
 */

/**
 * A step reads one thing at `start`, and returns where it ends, or what's wrong.
 *
 * @typedef {(value: string, start: number) => number | Problem} Step
 */

/** What every error that an `assert*` function throws has. */
export class FormatError extends Error {
  /**
   * @param {string} format
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(format, value, problem) {
    // A value that a pattern rejects always has a problem, which is checked by differential testing
    const { reason, part, start, end, text, positioned, hint } = /** @type Problem */ (problem);
    const position = positioned ? `, at ${start}` : "";
    super(`Invalid ${format}: ${value} — ${text}${position}${hint === undefined ? "" : `; ${hint}`}`);

    /**
     * The value that isn't valid.
     *
     * @readonly
     */
    this.value = value;

    /**
     * What's wrong with `value`.
     *
     * @readonly
     */
    this.reason = reason;

    /**
     * The part of `value` that's wrong.
     *
     * @readonly
     */
    this.part = part;

    /**
     * Where the problem starts in `value`, as a UTF-16 index like any index of a JavaScript string. The problem is
     * `value.slice(start, end)`.
     *
     * @readonly
     */
    this.start = start;

    /**
     * Where the problem ends in `value`, exclusive. Something that's missing is empty where it would go, with `start`
     * and `end` the same.
     *
     * @readonly
     */
    this.end = end;
  }
}

/**
 * @param {string} reason
 * @param {string} part
 * @param {number} start
 * @param {number} end
 * @param {string} text
 * @param {string} [hint]
 * @returns {Problem}
 */
export const problem = (reason, part, start, end, text, hint) => {
  return { reason, part, start, end, text, positioned: true, hint };
};

/** @type (problem: Problem) => Problem */
export const unpositioned = (problem) => ({ ...problem, positioned: false });

/**
 * A problem that a diagnosis of part of a value found, moved to where that part starts.
 *
 * @type (problem: Problem, offset: number, part?: string) => Problem
 */
export const nest = (problem, offset, part = problem.part) => {
  return { ...problem, part, start: problem.start + offset, end: problem.end + offset };
};

/** @type (problem: number | Problem | undefined) => problem is Problem */
export const isProblem = (problem) => typeof problem === "object";

/** @type (value: string, index: number) => string */
export const charAt = (value, index) => String.fromCodePoint(/** @type number */ (value.codePointAt(index)));

// Visible means a letter, mark, number, punctuation, symbol, or U+0020
const isVisible = /^[\p{L}\p{M}\p{N}\p{P}\p{S} ]$/u;

/** @type (text: string) => string */
export const show = (text) => text.length === String.fromCodePoint(/** @type number */ (text.codePointAt(0))).length
  && !isVisible.test(text)
  ? "U+" + /** @type number */ (text.codePointAt(0)).toString(16)
    .toUpperCase()
    .padStart(4, "0")
  : JSON.stringify(text);

/**
 * The character at `index` isn't allowed. `where` is how the message says where it is, like "in the year".
 *
 * @type (value: string, index: number, part: string, where?: string, hint?: string) => Problem
 */
export const invalidCharacter = (value, index, part, where = `in the ${part}`, hint) => {
  const char = charAt(value, index);
  return problem("invalid-character", part, index, index + char.length, `${show(char)} isn't allowed ${where}`, hint);
};

/** @type (part: string, index: number, text?: string) => Problem */
export const missing = (part, index, text = `it has no ${part}`) => {
  return problem("missing", part, index, index, text);
};

/** @type (part: string, start: number, end: number, expected: string, hint?: string) => Problem */
export const invalidValue = (part, start, end, expected, hint) => {
  return problem("invalid-value", part, start, end, `the ${part} must be ${expected}`, hint);
};

/**
 * A pattern compiled with `anchored: false`, which matches as much as it can at a given index.
 *
 * @type (pattern: RegExp) => RegExp
 */
export const sticky = (pattern) => new RegExp(pattern.source, "uy");

/**
 * Where the longest match of a sticky pattern at `start` ends.
 *
 * @type (pattern: RegExp, value: string, start: number) => number
 */
export const matchEnd = (pattern, value, start) => {
  pattern.lastIndex = start;
  const match = pattern.exec(value);
  return match === null ? start : start + match[0].length;
};

/**
 * Runs steps one after another, from `start`. It returns where the last one ends, or the first problem.
 *
 * @type (value: string, start: number, steps: Step[]) => number | Problem
 */
export const sequence = (value, start, steps) => {
  let position = start;
  for (const step of steps) {
    const result = step(value, position);
    if (isProblem(result)) {
      return result;
    }
    position = result;
  }

  return position;
};

/**
 * A part that's a run of the characters `chars` matches (a sticky pattern), which then has to match `rule` (an anchored
 * pattern).
 *
 * @type (part: string, chars: RegExp, rule: RegExp, expected: string, hint?: string) => Step
 */
export const field = (part, chars, rule, expected, hint) => (value, start) => {
  const end = matchEnd(chars, value, start);
  if (end === start) {
    return start === value.length ? missing(part, start) : invalidCharacter(value, start, part);
  }

  return rule.test(value.slice(start, end)) ? end : invalidValue(part, start, end, expected, hint);
};

/**
 * A delimiter, `text`, after the part `after` and before the part `next`. `text` is matched in any case if `anyCase`.
 *
 * @type (text: string, after: string, next: string, anyCase?: boolean) => Step
 */
export const delimiter = (text, after, next, anyCase = false) => (value, start) => {
  const found = value.slice(start, start + text.length);
  if (anyCase ? found.toLowerCase() === text.toLowerCase() : found === text) {
    return start + text.length;
  }

  return start === value.length
    ? missing(next, start)
    : invalidCharacter(value, start, after, `after the ${after}`, `it must be ${show(text)}`);
};

/**
 * The end of the value, after the part `after`.
 *
 * @type (after: string) => Step
 */
export const end = (after) => (value, start) => {
  return start === value.length ? start : invalidCharacter(value, start, after, `after the ${after}`);
};
