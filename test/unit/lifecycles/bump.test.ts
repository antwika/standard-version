import semver from 'semver';
import runLifecycleScriptLib from '../../../src/run-lifecycle-script';
import { bump } from '../../../src/lifecycles/bump';

jest.mock('semver');

describe('bump', () => {
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
});
