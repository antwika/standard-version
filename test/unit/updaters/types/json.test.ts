import { isPrivate, readVersion, writeVersion } from '../../../../src/updaters/types/json';

describe('json', () => {
  it('extracts the version value from provided content', () => {
    const pkg = {
      version: '1.2.3',
    };
    expect(readVersion(JSON.stringify(pkg))).toBe('1.2.3');
  });

  it('extracts the private value from provided content', () => {
    const pkg = {
      private: true,
    };
    expect(isPrivate(JSON.stringify(pkg))).toBeTruthy();
  });

  it('can update the version number in the provided package', () => {
    const pkg = {
      private: true,
      version: '1.2.3',
      packages: {
        '': { version: '1.2.3' },
      },
    };
    const result = writeVersion(JSON.stringify(pkg, null, 2), '1.2.4');
    const parsed = JSON.parse(result);
    expect(parsed.private).toBe(true);
    expect(parsed.version).toBe('1.2.4');
    expect(parsed.packages[''].version).toBe('1.2.4');
  });
});
