import chalk from 'chalk';
import util from 'util';
import runExecFile from '../../src/run-execFile';

jest.mock('child_process');
jest.mock('util');

describe('run-execFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not execute anything if "dryRun" argument is set to "true".', async () => {
    const result = await runExecFile({ dryRun: true }, 'foo', ['-h']);
    expect(result).not.toBeDefined();
  });

  it('executes the command but returns a printed warning message if there is a failure during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => ({ stderr: 'a warning', stdout: undefined }));
    jest.spyOn(global.console, 'warn').mockImplementation();
    await runExecFile({ dryRun: false }, 'foo', ['-h']);
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow('a warning'));
  });

  it('executes the command but returns a printed error message if there is a fatal error during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => { throw new Error('Fatal error'); });
    jest.spyOn(global.console, 'error').mockImplementation();
    await expect(() => runExecFile({ dryRun: false }, 'foo', ['-h'])).rejects.toThrowError('Fatal error');
    expect(console.error).toHaveBeenCalledWith(chalk.red('Fatal error'));
  });
});