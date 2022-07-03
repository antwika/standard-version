import tag from '../../../src/lifecycles/tag';
import { runLifecycleScript } from '../../../src/run-lifecycle-script';
import runExecFileLib from '../../../src/run-execFile';
import checkpoint from '../../../src/checkpoint';

jest.mock('../../../src/run-lifecycle-script');
jest.mock('../../../src/run-execFile');
jest.mock('../../../src/checkpoint');

describe('tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not do any tagging, if argument "skip.tag" is set to "true".', async () => {
    const result = await tag('1.2.3', false, {
      silent: true,
      tagPrefix: 'v',
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: true,
      },
    });
    expect(result).not.toBeDefined();
  });

  it('throws an error if "currentBranch" is considered to be "undefined".', async () => {
    await expect(() => tag('1.2.3', false, {
      silent: true,
      tagPrefix: 'v',
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
    })).rejects.toThrowError('The current branch is "undefined" and the execTag function could not properly continue...');
    expect(runLifecycleScript).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'pretag',
    );
    expect(checkpoint).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'tagging release %s%s',
      [
        'v',
        '1.2.3',
      ],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'git',
      ['tag', '-a', 'v1.2.3', '-m', 'Format message 1.2.3'],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      '',
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
    );
  });

  it('calls.', async () => {
    jest.spyOn(runExecFileLib, 'runExecFile').mockImplementationOnce(async () => 'branch-name');
    await expect(() => tag('1.2.3', false, {
      silent: true,
      tagPrefix: 'v',
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
    })).rejects.toThrowError('The current branch is "undefined" and the execTag function could not properly continue...');
    expect(runLifecycleScript).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'pretag',
    );
    expect(checkpoint).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'tagging release %s%s',
      [
        'v',
        '1.2.3',
      ],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      {
        releaseCommitMessageFormat: 'Format message {{currentTag}}',
        silent: true,
        skip: { tag: false },
        tagPrefix: 'v',
      },
      'git',
      ['tag', '-a', 'v1.2.3', '-m', 'Format message 1.2.3'],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      '',
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
    );
  });
});
