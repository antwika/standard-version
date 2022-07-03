import { readVersion, writeVersion } from '../../../../src/updaters/types/plain-text';

describe('plain-text', () => {
  it('assumes the contents represents the version.', () => {
    expect(readVersion('1.2.3')).toBe('1.2.3');
  });

  it('just returns the version provided.', () => {
    expect(writeVersion('totally ignored', '1.2.3')).toBe('1.2.3');
  });
});
