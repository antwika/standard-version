import chalk from 'chalk';
import figures from 'figures';
import util from 'util';

export default (argv: any, msg: any, args: any, figure?: any) => {
  const defaultFigure = args.dryRun ? chalk.yellow(figures.tick) : chalk.green(figures.tick);
  if (!argv.silent) {
    const input = [msg].concat(args.map((arg: any) => chalk.bold(arg)));
    const temp = util.format(...input);
    console.info(`${(figure || defaultFigure)} ${temp}`);
  }
};
