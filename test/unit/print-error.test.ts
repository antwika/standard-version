import chalk from 'chalk';
import printError from '../../src/print-error';

describe('print-error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('by default outputs an error message to console in red text.', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: false }, 'Test message', {});
    expect(console.error).toHaveBeenCalledWith(chalk.red('Test message'));
  });

  it('can be overridden with optional arguments to output messages in other colors.', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: false }, 'Green message', { color: 'green' });
    expect(console.error).toHaveBeenCalledWith(chalk.green('Green message'));

    printError({ silent: false }, 'Yellow message', { color: 'yellow' });
    expect(console.error).toHaveBeenCalledWith(chalk.yellow('Yellow message'));
  });

  it('does not out anything if silent it set to "true".', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    printError({ silent: true }, 'Green message', {});
    expect(console.error).not.toHaveBeenCalled();
  });

  it('can be overridden with optional arguments to output messages as "info" instead of "error".', () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    printError({ silent: false }, 'Info message', { level: 'info' });
    expect(console.info).toHaveBeenCalledWith(chalk.red('Info message'));
  });

  it('can be overridden with optional arguments to output messages as "warn" instead of "error".', () => {
    jest.spyOn(global.console, 'warn').mockImplementation();
    printError({ silent: false }, 'Warn message', { level: 'warn' });
    expect(console.warn).toHaveBeenCalledWith(chalk.red('Warn message'));
  });

  it('can be overridden with optional arguments to output messages as "log" instead of "error".', () => {
    jest.spyOn(global.console, 'log').mockImplementation();
    printError({ silent: false }, 'Log message', { level: 'log' });
    expect(console.log).toHaveBeenCalledWith(chalk.red('Log message'));
  });

  it('can be overridden with optional arguments to output messages as "debug" instead of "error".', () => {
    jest.spyOn(global.console, 'debug').mockImplementation();
    printError({ silent: false }, 'Debug message', { level: 'debug' });
    expect(console.debug).toHaveBeenCalledWith(chalk.red('Debug message'));
  });
});