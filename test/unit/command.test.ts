import yargs from 'yargs';
import command from '../../src/command';

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

jest.mock('yargs', () => ({
  usage: jest.fn().mockReturnThis(),
  option: jest.fn().mockReturnThis(),
  check: jest.fn().mockReturnThis(),
  alias: jest.fn().mockReturnThis(),
  example: jest.fn().mockReturnThis(),
  pkgConf: jest.fn().mockReturnThis(),
  config: jest.fn().mockReturnThis(),
  wrap: jest.fn().mockReturnThis(),
}));

jest.mock('../../src/defaults', () => ({
  getDefaults: jest.fn().mockReturnValue({
    preMajor: true,
    packageFiles: ['testfile-1.json'],
    bumpFiles: ['testfile-1.json', 'testfile-2.json'],
    infile: 'test-changelog.md',
    firstRelease: true,
    sign: false,
    noVerify: false,
    commitAll: false,
    silent: false,
    tagPrefix: 'test',
    scripts: {},
    skip: {},
    dryRun: true,
    gitTagFallback: true,
    preset: 'a-preset-path',
  }),
}));

jest.mock('../../src/configuration', () => ({
  getConfiguration: jest.fn().mockReturnValue(
    {
      types: [
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'test', section: 'Tests', hidden: true },
        { type: 'build', section: 'Build System', hidden: true },
        { type: 'ci', hidden: true },
      ],
    },
  ),
}));

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

describe('command', () => {
  it('calls the yargs builder with expected values', () => {
    command.getParser();
    expect(command).toBeDefined();
    expect(yargs.usage).toHaveBeenCalledWith('Usage: $0 [options]');
    expect(yargs.option).toHaveBeenCalledWith('packageFiles', {
      default: ['testfile-1.json'],
      array: true,
    });
    expect(yargs.option).toHaveBeenCalledWith('bumpFiles', {
      default: ['testfile-1.json', 'testfile-2.json'],
      array: true,
    });
    expect(yargs.option).toHaveBeenCalledWith('release-as', {
      alias: 'r',
      describe: 'Specify the release type manually (like npm version <major|minor|patch>)',
      requiresArg: true,
      string: true,
    });
    expect(yargs.option).toHaveBeenCalledWith('prerelease', {
      alias: 'p',
      describe: 'make a pre-release with optional option value to specify a tag id',
      string: true,
    });
    expect(yargs.option).toHaveBeenCalledWith('infile', {
      alias: 'i',
      describe: 'Read the CHANGELOG from this file',
      default: 'test-changelog.md',
    });
    expect(yargs.option).toHaveBeenCalledWith('message', {
      alias: ['m'],
      describe: '[DEPRECATED] Commit message, replaces %s with new version.\nThis option will be removed in the next major version, please use --releaseCommitMessageFormat.',
      type: 'string',
    });
    expect(yargs.option).toHaveBeenCalledWith('first-release', {
      alias: 'f',
      describe: 'Is this the first release?',
      type: 'boolean',
      default: true,
    });
    expect(yargs.option).toHaveBeenCalledWith('sign', {
      alias: 's',
      describe: 'Should the git commit and tag be signed?',
      type: 'boolean',
      default: false,
    });
    expect(yargs.option).toHaveBeenCalledWith('no-verify', {
      alias: 'n',
      describe: 'Bypass pre-commit or commit-msg git hooks during the commit phase',
      type: 'boolean',
      default: false,
    });
    expect(yargs.option).toHaveBeenCalledWith('commit-all', {
      alias: 'a',
      describe: 'Commit all staged changes, not just files affected by standard-version',
      type: 'boolean',
      default: false,
    });
    expect(yargs.option).toHaveBeenCalledWith('silent', {
      describe: 'Don\'t print logs and errors',
      type: 'boolean',
      default: false,
    });
    expect(yargs.option).toHaveBeenCalledWith('tag-prefix', {
      alias: 't',
      describe: 'Set a custom prefix for the git tag to be created',
      type: 'string',
      default: 'test',
    });
    expect(yargs.option).toHaveBeenCalledWith('scripts', {
      describe: 'Provide scripts to execute for lifecycle events (prebump, precommit, etc.,)',
      default: {},
    });
    expect(yargs.option).toHaveBeenCalledWith('skip', {
      describe: 'Map of steps in the release process that should be skipped',
      default: {},
    });
    expect(yargs.option).toHaveBeenCalledWith('dry-run', {
      type: 'boolean',
      default: true,
      describe: 'See the commands that running standard-version would run',
    });
    expect(yargs.option).toHaveBeenCalledWith('git-tag-fallback', {
      type: 'boolean',
      default: true,
      describe: 'fallback to git tags for version, if no meta-information file is found (e.g., package.json)',
    });
    expect(yargs.option).toHaveBeenCalledWith('path', {
      type: 'string',
      describe: 'Only populate commits made under this path',
    });
    expect(yargs.option).toHaveBeenCalledWith('changelogHeader', {
      type: 'string',
      describe: '[DEPRECATED] Use a custom header when generating and updating changelog.\nThis option will be removed in the next major version, please use --header.',
    });
    expect(yargs.option).toHaveBeenCalledWith('preset', {
      type: 'string',
      default: 'a-preset-path',
      describe: 'Commit message guideline preset',
    });
    expect(yargs.option).toHaveBeenCalledWith('lerna-package', {
      type: 'string',
      describe: 'Name of the package from which the tags will be extracted',
    });
    expect(yargs.alias).toHaveBeenCalledWith('version', 'v');
    expect(yargs.alias).toHaveBeenCalledWith('help', 'h');
    expect(yargs.example).toHaveBeenCalledWith('$0', 'Update changelog and tag release');
    expect(yargs.example).toHaveBeenCalledWith('$0 -m "%s: see changelog for details"', 'Update changelog and tag release with custom commit message');
    expect(yargs.pkgConf).toHaveBeenCalledWith('standard-version');
    expect(yargs.config).toHaveBeenCalledWith({
      types: [
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'test', section: 'Tests', hidden: true },
        { type: 'build', section: 'Build System', hidden: true },
        { type: 'ci', hidden: true },
      ],
    });
    expect(yargs.wrap).toHaveBeenCalledWith(97);
  });
});
