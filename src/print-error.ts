// TODO: This type is incomplete and just types a subset of its properties.
type PrintErrorArgs = {
  silent?: boolean,
  [key: string]: any;
}

// TODO: This type is incomplete and just types a subset of its properties.
type PrintErrorOpts = {
  level?: 'info' | 'warn' | 'error' | 'log' | 'debug',
  color?: string,
  [key: string]: any;
}

const printError = (args: PrintErrorArgs, msg: string, opts?: PrintErrorOpts) => {
  if (!args.silent) {
    const combined = { level: 'error', color: 'red', ...opts };

    const logger = console as any;

    logger[combined.level](msg);
  }
};

export default printError;
