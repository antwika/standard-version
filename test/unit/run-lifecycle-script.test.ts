import { runLifecycleScript } from '../../src/run-lifecycle-script';
import runExec from '../../src/run-exec';
import checkpoint from '../../src/checkpoint';

jest.mock('../../src/run-exec');
jest.mock('../../src/checkpoint');

describe('run-lifecycle-script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not execute anything if there is no "scripts" provided in the arguments.', async () => {
    const result = await runLifecycleScript({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
    }, 'hook-name');
    expect(result).not.toBeDefined();
    expect(runExec).toHaveBeenCalledTimes(0);
  });

  it('does not execute anything if "scripts" provided but the specific hook does not exist.', async () => {
    const result = await runLifecycleScript({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: {},
    }, 'hook-name');
    expect(result).not.toBeDefined();
    expect(runExec).toHaveBeenCalledTimes(0);
  });

  it('passes "silent" argument forward to the "checkpoint" function call.', async () => {
    await runLifecycleScript({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
    }, 'hook-name');
    expect(checkpoint).toHaveBeenCalledWith(
      { silent: true },
      expect.anything(),
      expect.anything(),
    );
    expect(runExec).toHaveBeenCalledWith(expect.anything(), 'foo -h');
    await runLifecycleScript({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
    }, 'hook-name');
    expect(checkpoint).toHaveBeenCalledWith(
      { silent: false },
      expect.anything(),
      expect.anything(),
    );
    expect(runExec).toHaveBeenCalledWith(expect.anything(), 'foo -h');
    expect(runExec).toHaveBeenCalledTimes(2);
  });
});
