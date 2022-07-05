import printError from '../../src/print-error';

describe('print-error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('by default outputs an error message to console in red text.', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: false }, 'Test message', 'error');
    expect(console.error).toHaveBeenCalledWith('Test message');
  });

  it('can be overridden with optional arguments to output messages in other colors.', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: false }, 'Green message', 'error');
    expect(console.error).toHaveBeenCalledWith('Green message');

    printError({ silent: false }, 'Yellow message', 'error');
    expect(console.error).toHaveBeenCalledWith('Yellow message');
  });

  it('does not out anything if silent it set to "true".', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: true }, 'Green message', 'error');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('can be overridden with optional arguments to output messages as "info" instead of "error".', () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    printError({ silent: false }, 'Info message', 'info');
    expect(console.info).toHaveBeenCalledWith('Info message');
  });

  it('can be overridden with optional arguments to output messages as "warn" instead of "error".', () => {
    jest.spyOn(global.console, 'warn').mockImplementation();
    printError({ silent: false }, 'Warn message', 'warn');
    expect(console.warn).toHaveBeenCalledWith('Warn message');
  });

  it('can be overridden with optional arguments to output messages as "log" instead of "error".', () => {
    jest.spyOn(global.console, 'log').mockImplementation();
    printError({ silent: false }, 'Log message', 'log');
    expect(console.log).toHaveBeenCalledWith('Log message');
  });

  it('can be overridden with optional arguments to output messages as "debug" instead of "error".', () => {
    jest.spyOn(global.console, 'debug').mockImplementation();
    printError({ silent: false }, 'Debug message', 'debug');
    expect(console.debug).toHaveBeenCalledWith('Debug message');
  });
});
