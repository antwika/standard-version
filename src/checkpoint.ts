import chalk from 'chalk';
import figures from 'figures';
import util from 'util';

// TODO: This type is incomplete and just types a subset of its properties.
type CheckpointArgv = {
  silent: boolean,
  [key: string]: any;
}

type CheckpointArgs = string[];

const checkpoint = (argv: CheckpointArgv, msg: string, args: CheckpointArgs, figure?: string) => {
  const defaultFigure = figures.tick;
  if (!argv.silent) {
    const input = [msg].concat(args.map((arg: any) => arg));
    const temp = util.format(...input);
    console.info(`${(figure || defaultFigure)} ${temp}`);
  }
};

export default checkpoint;
