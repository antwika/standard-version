const chalk = require('chalk');

module.exports = (args, msg, opts) => {
  if (!args.silent) {
    const combined = { level: 'error', color: 'red', ...opts };

    console[combined.level](chalk[combined.color](msg));
  }
};
