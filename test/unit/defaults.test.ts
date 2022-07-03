import { getDefaults } from '../../src/defaults';

jest.mock('conventional-changelog-config-spec', () => ({
  properties: {},
}));

describe('defaults', () => {
  it('produces expected default values', () => {
    expect(getDefaults().infile).toBe('CHANGELOG.md');
  });
});
