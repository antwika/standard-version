import util from 'util';
import { runExecFile } from '../../src/run-execFile';
import printError from '../../src/print-error';

jest.mock('child_process');
jest.mock('util');
jest.mock('../../src/print-error');

describe('run-execFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not execute anything if "dryRun" argument is set to "true".', async () => {
    const result = await runExecFile({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
      dryRun: true,
    }, 'foo', ['-h']);
    expect(result).not.toBeDefined();
  });

  it('executes the command but returns a printed warning message if there is a failure during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => ({ stderr: 'a warning', stdout: undefined }));
    jest.spyOn(global.console, 'warn').mockImplementation();
    await runExecFile({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
      dryRun: false,
    }, 'foo', ['-h']);
    expect(printError).toHaveBeenCalledWith(expect.anything(), 'a warning', 'warn');
    // expect(console.warn).toHaveBeenCalledWith('a warning');
  });

  it('executes the command but returns a printed error message if there is a fatal error during execution.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => { throw new Error('Fatal error'); });
    jest.spyOn(global.console, 'error').mockImplementation();
    await expect(() => runExecFile({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
      dryRun: false,
    }, 'foo', ['-h'])).rejects.toThrowError('Fatal error');
    expect(printError).toHaveBeenCalledWith(expect.anything(), 'Fatal error', 'error');
    // expect(console.error).toHaveBeenCalledWith('Fatal error');
  });
});
