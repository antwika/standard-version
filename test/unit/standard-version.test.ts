import fs from 'fs';
import path from 'path';
import bumpLib, { bump } from '../../src/lifecycles/bump';
import { changelog } from '../../src/lifecycles/changelog';
import { latestSemverTag } from '../../src/latest-semver-tag';
import { tag } from '../../src/lifecycles/tag';
import * as updaters from '../../src/updaters';
import { standardVersion } from '../../src/standard-version';

jest.mock('fs');
jest.mock('path');
jest.mock('../../src/lifecycles/bump');
jest.mock('../../src/lifecycles/changelog', () => ({
  changelog: jest.fn(),
  START_OF_LAST_RELEASE_PATTERN: /(^#+ \[?\d+\.\d+\.\d+|<a name=)/m,
}));
jest.mock('../../src/lifecycles/commit');
jest.mock('../../src/latest-semver-tag');
jest.mock('../../src/print-error');
jest.mock('../../src/lifecycles/tag');
jest.mock('../../src/updaters');
jest.mock('../../src/defaults', () => ({
  getDefaults: jest.fn().mockReturnValue({
    packageFiles: ['testfile-1.json'],
    bumpFiles: ['testfile-2.json', 'testfile-3.json'],
    infile: 'test-changelog.md',
    firstRelease: true,
    sign: false,
    noVerify: false,
    commitAll: false,
    silent: false,
    tagPrefix: 't',
    scripts: {},
    skip: {},
    dryRun: true,
    gitTagFallback: true,
    preset: 'a-preset-path',
  }),
}));

describe('standard-version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exits early if updater could not be resolved.', async () => {
    const result = await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      message: 'hello',
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    });

    expect(result).not.toBeDefined();
  });

  it('exits early if an updater was resolved, but its property "filename" is missing.', async () => {
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue({
      readVersion: jest.fn(),
      writeVersion: jest.fn(),
      isPrivate: jest.fn(),
      filename: undefined,
    });

    const result = await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      message: 'hello',
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    });

    expect(result).not.toBeDefined();
  });

  it('bumps version number, updates the changelog, git commits as well as tag the result.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      isPrivate: jest.fn().mockReturnValue(true),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '1.0.0' }));
    jest.spyOn(bumpLib, 'bump').mockResolvedValue('1.1.0');

    const result = await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
    });

    expect(result).not.toBeDefined();
    expect(updaters.resolveUpdaterObjectFromArgument).toHaveBeenCalledWith('custom-package-file');
    expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'test-updater-filename');
    expect(fs.readFileSync).toHaveBeenCalledWith('path-to-test-updater', 'utf8');
    expect(mockUpdater.readVersion).toHaveBeenCalledWith(JSON.stringify({ version: '1.0.0' }));
    expect(mockUpdater.isPrivate).toHaveBeenCalledWith(JSON.stringify({ version: '1.0.0' }));
    expect(bump).toHaveBeenCalledWith(expect.any(Object), '1.0.0');
    expect(changelog).toHaveBeenCalledWith(expect.any(Object), '1.1.0');
    expect(tag).toHaveBeenCalledWith('1.1.0', true, expect.any(Object));
  });

  it('prints deprecation warnings for outdated arguments.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      isPrivate: jest.fn().mockReturnValue(true),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '1.0.0' }));
    jest.spyOn(bumpLib, 'bump').mockResolvedValue('1.1.0');
    jest.spyOn(global.console, 'warn').mockImplementation();

    await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      message: 'Message (deprecated usage)',
      changelogHeader: '# Custom changelog header (deprecated usage)',
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    });

    expect(console.warn).toHaveBeenCalledWith('[standard-version]: --message (-m) will be removed in the next major release. Use --releaseCommitMessageFormat.');
    expect(console.warn).toHaveBeenCalledWith('[standard-version]: --changelogHeader will be removed in the next major release. Use --header.');
  });

  it('throws if the provided "header" matches/conflicts with the "START_OF_LAST_RELEASE_PATTERN" regex pattern.', async () => {
    await expect(() => standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: false,
      message: 'Message (deprecated usage)',
      changelogHeader: '# [1.2.3] My invalid changelog header',
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    })).rejects.toThrowError('custom changelog header must not match /(^#+ \\[?\\d+\\.\\d+\\.\\d+|<a name=)/m');
  });

  it('uses "latestSemverTag" when no version is present in the package.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      isPrivate: jest.fn().mockReturnValue(true),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '1.0.0' }));
    jest.spyOn(bumpLib, 'bump').mockResolvedValue('1.1.0');

    await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 't',
      skip: {},
      silent: false,
      message: 'Message (deprecated usage)',
      changelogHeader: '# Custom changelog header (deprecated usage)',
      packageFiles: [],
      bumpFiles: [],
      preset: {},
    });

    expect(latestSemverTag).toHaveBeenCalledWith('t');
  });

  it('throws if no package file was found.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      isPrivate: jest.fn().mockReturnValue(true),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '1.0.0' }));
    jest.spyOn(bumpLib, 'bump').mockResolvedValue('1.1.0');

    await expect(() => standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: [],
      bumpFiles: [],
      gitTagFallback: false,
      preset: {},
    })).rejects.toThrowError('no package file found');
  });

  it('prints a warning if a provided package file was not found.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      isPrivate: jest.fn().mockReturnValue(true),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => { throw new Error('Fatal error'); });
    jest.spyOn(global.console, 'warn').mockImplementation();

    await expect(() => standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['not-found-package-file.json'],
      bumpFiles: [],
      gitTagFallback: false,
      preset: {},
    })).rejects.toThrowError('no package file found');

    expect(console.warn).toHaveBeenCalledWith('Error thrown while trying to read package path path-to-test-updater ... Is this expected?');
  });

  it('defaults to private false, if the found updater has no isPrivate function.', async () => {
    const mockUpdater = {
      readVersion: jest.fn().mockReturnValue('1.0.0'),
      writeVersion: jest.fn(),
      filename: 'test-updater-filename',
    };
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValue(mockUpdater);
    jest.spyOn(path, 'resolve').mockReturnValue('path-to-test-updater');
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '1.0.0' }));
    jest.spyOn(bumpLib, 'bump').mockResolvedValue('1.1.0');

    await standardVersion({
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
    });

    expect(tag).toHaveBeenCalledWith(expect.anything(), false, expect.anything());
  });
});
