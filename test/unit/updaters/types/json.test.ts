import { isPrivate, readVersion, writeVersion } from '../../../../src/updaters/types/json';

const stringifyPackageMock = jest.fn();
jest.mock('stringify-package', () => (...args: any) => stringifyPackageMock(...args));

describe('json', () => {
  it('extracts the version value from provided content', () => {
    const pkg = {
      version: '1.2.3',
    };
    expect(readVersion(JSON.stringify(pkg))).toBe('1.2.3');
  });

  it('extracts the private value from provided content', () => {
    const p = {
      private: true,
    };
    expect(isPrivate(JSON.stringify(p))).toBeTruthy();
  });

  it('can overwrite the version number in the provided content', () => {
    const pkg = {
      private: true,
      version: '1.2.3',
      packages: {
        '': { version: '1.2.3' },
      },
    };
    stringifyPackageMock.mockImplementationOnce(() => '{}');
    writeVersion(JSON.stringify(pkg), '2.3.4');
    expect(stringifyPackageMock).toHaveBeenCalledWith(
      {
        packages: {
          '': {
            version: '2.3.4',
          },
        },
        private: true,
        version: '2.3.4',
      },
      '',
      undefined,
    );
  });
});
