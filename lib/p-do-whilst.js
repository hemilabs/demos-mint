"use strict";

// Taken from https://github.com/sindresorhus/p-do-whilst/blob/v2.1.0/index.js
// because the original package is ESM only.

async function pDoWhilst(action, condition, initialValue) {
  const actionResult = await action(initialValue);

  if (await condition(actionResult)) {
    return pDoWhilst(action, condition, actionResult);
  }

  return actionResult;
}

module.exports = pDoWhilst;
