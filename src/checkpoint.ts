import util from 'util';

type CheckpointArgv = {
  silent: boolean,
}

type CheckpointArgs = string[];

const checkpoint = (argv: CheckpointArgv, msg: string, args: CheckpointArgs, figure?: string) => {
  console.log('checkpoint silent:', argv.silent);
  const defaultFigure = '[OK]';
  if (!argv.silent) {
    const input = [msg].concat(args.map((arg: any) => arg));
    const temp = util.format(...input);
    console.info(`${(figure || defaultFigure)} ${temp}`);
  }
};

export default checkpoint;
