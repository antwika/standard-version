const chalk = require('chalk');
const figures = require('figures');
const util = require('util');

module.exports = (argv, msg, args, figure) => {
  const defaultFigure = args.dryRun ? chalk.yellow(figures.tick) : chalk.green(figures.tick);
  if (!argv.silent) {
    const input = [msg].concat(args.map((arg) => chalk.bold(arg)));
    const temp = util.format(...input);
    console.info(`${(figure || defaultFigure)} ${temp}`);
  }
};
