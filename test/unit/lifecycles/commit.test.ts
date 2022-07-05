import bump from '../../../src/lifecycles/bump';
import checkpoint from '../../../src/checkpoint';
import { runExecFile } from '../../../src/run-execFile';
import runLifecycleScriptLib from '../../../src/run-lifecycle-script';
import commit from '../../../src/lifecycles/commit';

jest.mock('path');
jest.mock('../../../src/lifecycles/bump');
jest.mock('../../../src/checkpoint');
jest.mock('../../../src/format-commit-message');
jest.mock('../../../src/run-execFile');
jest.mock('../../../src/run-lifecycle-script');

describe('commit', () => {
  it('exits early when argument "skip.commit" is set to "true".', async () => {
    const result = await commit({
      silent: true,
      skip: {
        commit: true,
      },
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
    }, '1.2.3');
    expect(result).not.toBeDefined();
  });

  it('sets the "releaseCommitMessageFormat" if the return value of runLifecycleScript is defined.', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementationOnce(async () => 'returned value from runLifecycleScript');
    jest.spyOn(bump, 'getUpdatedConfigs').mockImplementationOnce(() => []);
    const result = await commit({
      silent: true,
      verify: false,
      sign: false,
      skip: {
        bump: false,
        commit: false,
        changelog: true,
      },
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
    }, '1.2.3');
    expect(checkpoint).toHaveBeenCalledWith(expect.any(Object), 'committing %s', []);
    expect(result).not.toBeDefined();
    expect(runExecFile).toHaveBeenCalledWith(
      expect.any(Object),
      'git',
      ['add'],
    );
    expect(runExecFile).toHaveBeenCalledWith(
      expect.any(Object),
      'git',
      ['commit', '--no-verify', '-m', 'undefined'],
    );
  });

  it('exits early if argument "skip.bump" is set to "true".', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementationOnce(async () => 'returned value from runLifecycleScript');
    jest.spyOn(bump, 'getUpdatedConfigs').mockImplementationOnce(() => []);
    const result = await commit({
      silent: true,
      verify: false,
      sign: false,
      skip: {
        bump: true,
        commit: false,
        changelog: true,
      },
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
    }, '1.2.3');
    expect(checkpoint).toHaveBeenCalledWith(expect.any(Object), 'committing %s', []);
    expect(result).not.toBeDefined();
  });

  it('will run git hooks when argument "n" is set to "false" (by omitting the "--no-verify" flag).', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementationOnce(async () => 'returned value from runLifecycleScript');
    jest.spyOn(bump, 'getUpdatedConfigs').mockImplementationOnce(() => []);
    const result = await commit({
      silent: true,
      verify: true,
      n: false,
      sign: false,
      skip: {
        bump: true,
        commit: false,
        changelog: true,
      },
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
    }, '1.2.3');
    expect(checkpoint).toHaveBeenCalledWith(expect.any(Object), 'committing %s', []);
    expect(result).not.toBeDefined();
  });

  it('will add "-S" flag to "git tag" command if argument "skip" is set to "true".', async () => {
    jest.spyOn(bump, 'getUpdatedConfigs').mockImplementationOnce(() => ['package.json']);
    const result = await commit({
      silent: true,
      sign: true,
      skip: {
        commit: false,
      },
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
    }, '1.2.3');
    expect(result).not.toBeDefined();
  });
});
