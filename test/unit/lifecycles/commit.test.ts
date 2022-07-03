import path from 'path';
import bump from '../../../src/lifecycles/bump';
import checkpoint from '../../../src/checkpoint';
import formatCommitMessage from '../../../src/format-commit-message';
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
    }, '1.2.3');
    expect(result).not.toBeDefined();
  });

  it('sets the "releaseCommitMessageFormat" if the return value of runLifecycleScript is defined.', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementationOnce(async () => 'returned value from runLifecycleScript');
    jest.spyOn(bump, 'getUpdatedConfigs').mockImplementationOnce(async () => []);
    const result = await commit({
      silent: true,
      verify: false,
      sign: false,
      skip: {
        bump: false,
        commit: false,
        changelog: true,
      },
    }, '1.2.3');
    expect(checkpoint).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'returned value from runLifecycleScript',
        sign: false,
        silent: true,
        skip: {
          bump: false,
          changelog: true,
          commit: false,
        },
        verify: false,
      },
      'committing %s',
      [],
    );
    expect(result).not.toBeDefined();
    expect(runExecFile).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'returned value from runLifecycleScript',
        sign: false,
        silent: true,
        skip: {
          bump: false,
          changelog: true,
          commit: false,
        },
        verify: false,
      },
      'git',
      ['add'],
    );
    expect(runExecFile).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'returned value from runLifecycleScript',
        sign: false,
        silent: true,
        skip: {
          bump: false,
          changelog: true,
          commit: false,
        },
        verify: false,
      },
      'git',
      ['commit', '--no-verify', '-m', 'undefined'],
    );
  });
});
