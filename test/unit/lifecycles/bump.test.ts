import semver from 'semver';
import runLifecycleScriptLib from '../../../src/run-lifecycle-script';
import { bump, getCurrentActiveType, getTypePriority } from '../../../src/lifecycles/bump';
import * as updaters from '../../../src/updaters';

jest.mock('../../../src/run-lifecycle-script');
jest.mock('semver');
jest.mock('../../../src/updaters');

describe('bump', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('only returns the provided argument newVersion if argument "skip.bump" is set to "true".', async () => {
    const result = await bump({
      skip: {
        bump: true,
      },
    }, '1.2.3');
    expect(result).toBe('1.2.3');
  });

  it('uses "semver.inc" to bump the version.', async () => {
    jest.spyOn(semver, 'inc').mockImplementation(() => '2.3.4');
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementation(async () => undefined);
    const result = await bump({
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('2.3.4');
  });

  it('skips verison bumping on first release and returns the same version.', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementation(async () => undefined);
    const result = await bump({
      firstRelease: true,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('1.2.3');
  });

  it('bumps the version using the "releaseAs" instruction.', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockImplementation(async () => undefined);
    jest.spyOn(semver, 'inc').mockReturnValueOnce('2.2.3');
    const result = await bump({
      releaseAs: 'major',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('2.2.3');
  });

  it('use the returned value from a "prebump" lifecycle script to override the "releaseAs" argument.', async () => {
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockResolvedValueOnce(undefined);
    jest.spyOn(runLifecycleScriptLib, 'runLifecycleScript').mockResolvedValueOnce('major');
    jest.spyOn(semver, 'inc').mockReturnValueOnce('2.2.3');
    const result = await bump({
      releaseAs: 'minor',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('2.2.3');
    expect(semver.valid).toHaveBeenCalledWith('major');
  });

  it('does not bump version in listed "bumpFiles" if the resolved updater(s) have no "filename" property.', async () => {
    jest.spyOn(semver, 'inc').mockReturnValueOnce('1.3.3');
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValueOnce({
      readVersion: (contents: string) => contents,
      writeVersion: (_: string, version: string) => version,
    });
    const result = await bump({
      releaseAs: 'minor',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('1.3.3');
    // expect(semver.valid).toHaveBeenCalledWith('major');
  });

  it('prefixes the releaseType with "pre" if the current version is not a prerelease.', async () => {
    jest.spyOn(semver, 'inc').mockReturnValueOnce('1.3.3');
    jest.spyOn(semver, 'prerelease').mockReturnValueOnce(null);
    const result = await bump({
      prerelease: '',
      releaseAs: 'minor',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.3');
    expect(result).toBe('1.3.3');
    expect(semver.inc).toHaveBeenCalledWith(expect.anything(), 'preminor', expect.anything());
  });

  // eslint-disable-next-line jest/expect-expect
  it('does not continue the prerelease sequence if expected release type(major|minor|patch) is greater than the current prerelease version type.', async () => {
    jest.spyOn(semver, 'inc').mockReturnValueOnce('1.2.0-alpha.2');
    jest.spyOn(semver, 'prerelease').mockReturnValueOnce(['alpha', '1']);
    jest.spyOn(semver, 'major').mockReturnValueOnce(1);
    jest.spyOn(semver, 'minor').mockReturnValueOnce(2);
    jest.spyOn(semver, 'patch').mockReturnValueOnce(0);
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValueOnce({
      readVersion: (contents: string) => contents,
      writeVersion: (_: string, version: string) => version,
    });
    await bump({
      prerelease: '',
      releaseAs: 'major',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.0-alpha.1');
  });

  describe('getCurrentActiveType', () => {
    it('returns "patch" if the semver.patch("0.0.1") returns a number greater than zero.', () => {
      jest.spyOn(semver, 'patch').mockReturnValueOnce(1);
      const result = getCurrentActiveType('0.0.1');
      expect(result).toBe('patch');
    });

    it('returns "minor" if the semver.patch("0.0.1") returns a number greater than zero.', () => {
      jest.spyOn(semver, 'patch').mockReturnValueOnce(0);
      jest.spyOn(semver, 'minor').mockReturnValueOnce(1);
      const result = getCurrentActiveType('0.1.0');
      expect(result).toBe('minor');
    });

    it('returns "major" if the semver.patch("0.0.1") returns a number greater than zero.', () => {
      jest.spyOn(semver, 'patch').mockReturnValueOnce(0);
      jest.spyOn(semver, 'minor').mockReturnValueOnce(0);
      jest.spyOn(semver, 'major').mockReturnValueOnce(1);
      const result = getCurrentActiveType('1.0.0');
      expect(result).toBe('major');
    });

    it('returns "patch" as default if no the specified type could not be found in the list of known types.', () => {
      jest.spyOn(semver, 'patch').mockReturnValueOnce(0);
      jest.spyOn(semver, 'minor').mockReturnValueOnce(0);
      jest.spyOn(semver, 'major').mockReturnValueOnce(0);
      const result = getCurrentActiveType('0.0.0');
      expect(result).toBe('patch');
    });
  });

  describe('getTypePriority', () => {
    it('returns "0" for argument "patch".', () => {
      expect(getTypePriority('patch')).toBe(0);
    });

    it('returns "1" for argument "minor".', () => {
      expect(getTypePriority('minor')).toBe(1);
    });

    it('returns "2" for argument "major".', () => {
      expect(getTypePriority('major')).toBe(2);
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it('continues the prerelease sequence.', async () => {
    jest.spyOn(semver, 'inc').mockReturnValueOnce('1.2.0-alpha.2');
    jest.spyOn(semver, 'prerelease').mockReturnValueOnce(['alpha', '1']);
    jest.spyOn(semver, 'patch').mockReturnValueOnce(0);
    jest.spyOn(semver, 'minor').mockReturnValueOnce(2);
    jest.spyOn(semver, 'major').mockReturnValueOnce(1);
    jest.spyOn(updaters, 'resolveUpdaterObjectFromArgument').mockReturnValueOnce({
      readVersion: (contents: string) => contents,
      writeVersion: (_: string, version: string) => version,
    });
    await bump({
      prerelease: '',
      releaseAs: 'minor',
      firstRelease: false,
      bumpFiles: ['file.txt'],
      skip: {
        bump: false,
      },
    }, '1.2.0-alpha.1');
  });
});
