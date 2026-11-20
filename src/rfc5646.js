import { FormatError, invalidCharacter, invalidValue, matchEnd, missing, problem, show } from "./diagnose.js";
import {
  alphanums, extensionSubtag, extlangSubtag, languageTag as languageTagPattern, primaryLanguage, region, script,
  singleton, variant
} from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isLanguageTag
 * @function
 */
export const isLanguageTag = RegExp.prototype.test.bind(languageTagPattern);

/** @type API.assertLanguageTag */
export const assertLanguageTag = (tag) => {
  if (!isLanguageTag(tag)) {
    throw new InvalidLanguageTagError(tag, diagnoseLanguageTag(tag));
  }
};

/**
 * A value isn't a language tag. {@link assertLanguageTag} throws it.
 *
 * @hideconstructor
 */
export class InvalidLanguageTagError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("language", value, problem);
    this.name = "InvalidLanguageTagError";
  }
}

// Diagnosing

// Where a subtag is in a langtag, which decides what it can be. Each subtag's kind is fixed by its length and
// characters, so a tag is read one subtag at a time, and the kinds can only come in this order.
const LANGUAGE = 0;
const EXTLANG = 1;
const SCRIPT = 2;
const REGION = 3;
const VARIANT = 4;
const EXTENSION = 5;
const PRIVATE_USE = 6;

/**
 * What's been read of a tag so far. `singletonEnd` is where the extension being read starts its subtags, and `count`
 * is how many it has. A private use sequence counts its subtags in `count` too.
 *
 * @typedef {{
 *   stage: number;
 *   languageLength: number;
 *   extlangs: number;
 *   singleton: string;
 *   singletonEnd: number;
 *   count: number;
 * }} State
 */

/** @type (state: State) => string */
const partOf = (state) => {
  if (state.stage === LANGUAGE) {
    return "language";
  } else if (state.stage === EXTENSION) {
    return "extension";
  } else if (state.stage === PRIVATE_USE) {
    return "private use";
  } else {
    return "subtag";
  }
};

/**
 * The kinds of subtag that can come next, for a hint.
 *
 * @type (state: State) => string
 */
const whatCanComeNext = (state) => {
  const kinds = [];
  if (state.stage === EXTLANG && state.languageLength <= 3 && state.extlangs < 3) {
    kinds.push("an extended language (3 letters)");
  }
  if (state.stage <= SCRIPT) {
    kinds.push("a script (4 letters)");
  }
  if (state.stage <= REGION) {
    kinds.push("a region (2 letters or 3 digits)");
  }
  if (state.stage <= VARIANT) {
    kinds.push("a variant (5-8 letters and digits, or a digit and 3 more)");
  }
  kinds.push("an extension (a singleton and its subtags)", `private use ("x" and its subtags)`);
  return `a subtag here can be ${kinds.slice(0, -1).join(", ")}, or ${kinds.at(-1)}`;
};

/**
 * What's wrong with the extension or private use sequence being read, if it has no subtags. The problem is where they
 * would be, after its singleton.
 *
 * @type (state: State) => Problem | undefined
 */
const checkSubtags = (state) => {
  if (state.count > 0) {
    return undefined;
  } else if (state.stage === EXTENSION) {
    return missing("extension", state.singletonEnd, `the extension ${show(state.singleton)} has no subtags after it`);
  } else if (state.stage === PRIVATE_USE) {
    return missing("private use", state.singletonEnd, `"x" has no subtags after it`);
  }
};

/**
 * Reads the subtag at `start`, and returns what's wrong with it, if anything. It updates `state`.
 *
 * @type (tag: string, start: number, end: number, state: State) => Problem | undefined
 */
const readSubtag = (tag, start, end, state) => {
  const subtag = tag.slice(start, end);
  if (subtag.length > 8) {
    return problem("too-long", partOf(state), start + 8, end, "a subtag can have at most 8 characters");
  }

  if (state.stage === LANGUAGE) {
    if (subtag === "x" || subtag === "X") {
      state.stage = PRIVATE_USE;
      state.singleton = subtag;
      state.singletonEnd = end;
    } else if (primaryLanguage.test(subtag)) {
      state.stage = EXTLANG;
      state.languageLength = subtag.length;
    } else {
      const digit = subtag.search(/\d/u);
      return digit === -1
        ? invalidValue("language", start, end, "2-8 letters")
        : invalidCharacter(tag, start + digit, "language", "in the language", "a language has only letters");
    }
  } else if (state.stage === PRIVATE_USE) {
    state.count++;
  } else if (subtag.length === 1) {
    // A singleton starts an extension, and "x" starts private use. Either ends an extension, which has to have subtags.
    const subtagsProblem = checkSubtags(state);
    if (subtagsProblem !== undefined) {
      return subtagsProblem;
    }
    state.stage = singleton.test(subtag) ? EXTENSION : PRIVATE_USE;
    state.singleton = subtag;
    state.singletonEnd = end;
    state.count = 0;
  } else if (state.stage === EXTENSION && extensionSubtag.test(subtag)) {
    state.count++;
  } else if (state.stage === EXTLANG && state.languageLength <= 3 && state.extlangs < 3 && extlangSubtag.test(subtag)) {
    state.extlangs++;
  } else if (state.stage <= SCRIPT && script.test(subtag)) {
    state.stage = REGION;
  } else if (state.stage <= REGION && region.test(subtag)) {
    state.stage = VARIANT;
  } else if (state.stage <= VARIANT && variant.test(subtag)) {
    state.stage = VARIANT;
  } else {
    return problem("invalid-value", "subtag", start, end, `${show(subtag)} can't be a subtag here`, whatCanComeNext(state));
  }
};

/** @type (tag: string) => Problem | undefined */
const diagnoseLanguageTag = (tag) => {
  if (tag === "") {
    return missing("language", 0, "it's empty");
  }

  /** @type State */
  const state = { stage: LANGUAGE, languageLength: 0, extlangs: 0, singleton: "", singletonEnd: 0, count: 0 };
  let position = 0;
  while (true) {
    const end = matchEnd(alphanums, tag, position);
    if (end === position) {
      if (position === tag.length) {
        return missing(partOf(state), position, `it has nothing after "-"`);
      } else if (tag[position] === "-") {
        return invalidCharacter(tag, position, partOf(state), position === 0 ? "at the start" : `after "-"`);
      }
      return invalidCharacter(tag, position, partOf(state), "in a language tag", `subtags have letters and digits, separated by "-"`);
    } else if (end < tag.length && tag[end] !== "-") {
      return invalidCharacter(tag, end, partOf(state), "in a language tag", `subtags have letters and digits, separated by "-"`);
    }

    const subtagProblem = readSubtag(tag, position, end, state);
    if (subtagProblem !== undefined) {
      return subtagProblem;
    } else if (end === tag.length) {
      return checkSubtags(state);
    }
    position = end + 1;
  }
};
