type PrintLevel = 'info' | 'warn' | 'error' | 'log' | 'debug';

type PrintErrorArgs = {
  silent?: boolean,
}

const printError = (args: PrintErrorArgs, msg: string, level: PrintLevel) => {
  if (args.silent) return;

  switch (level) {
    case 'info': console.info(msg); break;
    case 'warn': console.warn(msg); break;
    case 'error': console.error(msg); break;
    case 'log': console.log(msg); break;
    case 'debug': console.debug(msg); break;
    default: throw new Error('A log known level must be specified.');
  }
};

export default printError;
