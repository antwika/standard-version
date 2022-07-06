import util from 'util';
import runExec from '../../src/run-exec';
import printError from '../../src/print-error';

jest.mock('child_process');
jest.mock('util');
jest.mock('../../src/print-error');

describe('run-exec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not execute anything if "dryRun" argument is set to "true".', async () => {
    const result = await runExec({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      silent: true,
      sign: true,
      dryRun: true,
      skip: {},
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    }, 'foo -h');
    expect(result).not.toBeDefined();
  });

  it('executes the command but prints a warning message if there is a failure during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => ({ stderr: 'a warning', stdout: undefined }));
    jest.spyOn(global.console, 'warn').mockImplementation();
    await runExec({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      silent: true,
      sign: true,
      dryRun: false,
      skip: {},
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    }, 'foo -h');
    expect(printError).toHaveBeenCalledWith(expect.anything(), 'a warning', 'warn');
    // expect(console.warn).toHaveBeenCalledWith('a warning');
  });

  it('executes the command but prints an error message and rethrows the error if there is a fatal error during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => { throw new Error('Fatal error'); });
    jest.spyOn(global.console, 'error').mockImplementation();
    await expect(() => runExec({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      silent: true,
      sign: true,
      dryRun: false,
      skip: {},
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    }, 'foo -h')).rejects.toThrowError('Fatal error');
    expect(printError).toHaveBeenCalledWith(expect.anything(), 'Fatal error', 'error');
    // expect(console.error).toHaveBeenCalledWith('Fatal error');
  });
});
