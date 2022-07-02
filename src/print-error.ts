import chalk from 'chalk';

const printError = (args: any, msg: any, opts?: any) => {
  if (!args.silent) {
    const combined = { level: 'error', color: 'red', ...opts };

    const anyChalk = chalk as any;
    const logger = console as any;

    logger[combined.level](anyChalk[combined.color](msg));
  }
};

export default printError;
