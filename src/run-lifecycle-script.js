const chalk = require('chalk');
const figures = require('figures');
const checkpoint = require('./checkpoint');
const runExec = require('./run-exec');

module.exports = (args, hookName) => {
  const { scripts } = args;
  if (!scripts || !scripts[hookName]) return Promise.resolve();
  const command = scripts[hookName];
  checkpoint(args, 'Running lifecycle script "%s"', [hookName]);
  checkpoint(args, '- execute command: "%s"', [command], chalk.blue(figures.info));
  return runExec(args, command);
};
