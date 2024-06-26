#!/usr/bin/env node

const standardVersion = require('../dist/index').default;
const command = require('../dist/command').default;

/* istanbul ignore if */

if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error('standard-version: Node v6 or greater is required. `standard-version` did not run.');
} else {
  standardVersion(command.getParser().argv)
    .catch((err) => {
      console.log('Error:', err);
      process.exit(1);
    });
}
