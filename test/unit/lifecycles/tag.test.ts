import { tag } from '../../../src/lifecycles/tag';
import { runLifecycleScript } from '../../../src/run-lifecycle-script';
import runExecFileLib from '../../../src/run-execFile';
import checkpoint from '../../../src/checkpoint';
import bumpLib from '../../../src/lifecycles/bump';

jest.mock('../../../src/run-lifecycle-script');
jest.mock('../../../src/run-execFile');
jest.mock('../../../src/checkpoint');
jest.mock('../../../src/lifecycles/bump');

describe('tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not do any tagging, if argument "skip.tag" is set to "true".', async () => {
    const result = await tag('1.2.3', false, {
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      skip: {
        tag: true,
      },
      sign: false,
    });
    expect(result).not.toBeDefined();
  });

  it('throws an error if "currentBranch" is considered to be "undefined".', async () => {
    await expect(() => tag('1.2.3', false, {
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      skip: {
        tag: false,
      },
      sign: false,
    })).rejects.toThrowError('The current branch is "undefined" and the execTag function could not properly continue...');
    expect(runLifecycleScript).toHaveBeenCalledWith(expect.anything(), 'pretag');
    expect(checkpoint).toHaveBeenCalledWith(
      expect.anything(),
      'tagging release %s%s',
      [
        'v',
        '1.2.3',
      ],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      expect.anything(),
      'git',
      ['tag', '-a', 'v1.2.3', '-m', 'Format message 1.2.3'],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith({}, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  });

  it('calls.', async () => {
    jest.spyOn(runExecFileLib, 'runExecFile').mockImplementationOnce(async () => 'branch-name');
    await expect(() => tag('1.2.3', false, {
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
      sign: false,
    })).rejects.toThrowError('The current branch is "undefined" and the execTag function could not properly continue...');
    expect(runLifecycleScript).toHaveBeenCalledWith(
      expect.anything(),
      'pretag',
    );
    expect(checkpoint).toHaveBeenCalledWith(
      expect.anything(),
      'tagging release %s%s',
      [
        'v',
        '1.2.3',
      ],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith(
      expect.anything(),
      'git',
      ['tag', '-a', 'v1.2.3', '-m', 'Format message 1.2.3'],
    );
    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith({}, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  });

  it('calls "git tag" with "-s" flag for signing.', async () => {
    jest.spyOn(runExecFileLib, 'runExecFile').mockResolvedValue('main');
    jest.spyOn(bumpLib, 'getUpdatedConfigs').mockImplementationOnce(() => ({ 'package.json': true }));

    await tag('1.2.3', false, {
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
      sign: true,
    });

    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith({}, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'tagging release %s%s', ['v', '1.2.3']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'Run `%s` to publish', ['git push --follow-tags origin main && npm publish'], '[INFO]');
  });

  it('appends "--tag prerelease" to the "npm publish" command if argument "prerelease" is an empty string.', async () => {
    jest.spyOn(runExecFileLib, 'runExecFile').mockResolvedValue('main');
    jest.spyOn(bumpLib, 'getUpdatedConfigs').mockImplementationOnce(() => ({ 'package.json': true }));

    await tag('1.2.3', false, {
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
      sign: true,
      prerelease: '',
    });

    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith({}, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'tagging release %s%s', ['v', '1.2.3']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'Run `%s` to publish', ['git push --follow-tags origin main && npm publish --tag prerelease'], '[INFO]');
  });

  it('appends "--tag custom-prerelease" to the "npm publish" command if argument "prerelease" is an "custom-prerelease".', async () => {
    jest.spyOn(runExecFileLib, 'runExecFile').mockResolvedValue('main');
    jest.spyOn(bumpLib, 'getUpdatedConfigs').mockImplementationOnce(() => ({ 'package.json': true }));

    await tag('1.2.3', false, {
      tagPrefix: 'v',
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      preset: {},
      dryRun: true,
      scripts: { 'hook-name': 'foo -h' },
      releaseCommitMessageFormat: 'Format message {{currentTag}}',
      skip: {
        tag: false,
      },
      sign: true,
      prerelease: 'custom-prerelease',
    });

    expect(runExecFileLib.runExecFile).toHaveBeenCalledWith({}, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'tagging release %s%s', ['v', '1.2.3']);
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'Run `%s` to publish', ['git push --follow-tags origin main && npm publish --tag custom-prerelease'], '[INFO]');
  });
});
