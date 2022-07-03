import { getDefaults } from '../../src/defaults';

jest.mock('conventional-changelog-config-spec', () => ({
  properties: {
    types: { default: [{ type: 'test', hidden: false }] },
    preMajor: { default: false },
    commitUrlFormat: { default: 'a test commit url format' },
    compareUrlFormat: { default: 'a test compare url format' },
    issueUrlFormat: { default: 'a test issue url format' },
    userUrlFormat: { default: 'a test user url format' },
    releaseCommitMessageFormat: { default: 'test release commit message format' },
    issuePrefixes: { default: 'a test issue prefixes' },
  },
}));

describe('defaults', () => {
  it('copies default values from conventional-changelog-config-spec', () => {
    const defaults = getDefaults();
    expect(defaults.preset).toBeDefined();
    expect(defaults.types).toStrictEqual([{ type: 'test', hidden: false }]);
    expect(defaults.preMajor).toBe(false);
    expect(defaults.commitUrlFormat).toBe('a test commit url format');
    expect(defaults.compareUrlFormat).toBe('a test compare url format');
    expect(defaults.issueUrlFormat).toBe('a test issue url format');
    expect(defaults.userUrlFormat).toBe('a test user url format');
    expect(defaults.releaseCommitMessageFormat).toBe('test release commit message format');
    expect(defaults.issuePrefixes).toBe('a test issue prefixes');
  });

  it('resolves the path to "conventional-changelog-conventionalcommits" package.', () => {
    const defaults = getDefaults();
    expect(defaults.preset).toMatch(/conventionalcommits/);
  });
});
