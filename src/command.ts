import spec from 'conventional-changelog-config-spec';
import yargs from 'yargs';
import { getConfiguration } from './configuration';
import { getDefaults } from './defaults';

const command = yargs
  .usage('Usage: $0 [options]')
  .option('packageFiles', {
    default: getDefaults().packageFiles,
    array: true,
  })
  .option('bumpFiles', {
    default: getDefaults().bumpFiles,
    array: true,
  })
  .option('release-as', {
    alias: 'r',
    describe: 'Specify the release type manually (like npm version <major|minor|patch>)',
    requiresArg: true,
    string: true,
  })
  .option('prerelease', {
    alias: 'p',
    describe: 'make a pre-release with optional option value to specify a tag id',
    string: true,
  })
  .option('infile', {
    alias: 'i',
    describe: 'Read the CHANGELOG from this file',
    default: getDefaults().infile,
  })
  .option('message', {
    alias: ['m'],
    describe: '[DEPRECATED] Commit message, replaces %s with new version.\nThis option will be removed in the next major version, please use --releaseCommitMessageFormat.',
    type: 'string',
  })
  .option('first-release', {
    alias: 'f',
    describe: 'Is this the first release?',
    type: 'boolean',
    default: getDefaults().firstRelease,
  })
  .option('sign', {
    alias: 's',
    describe: 'Should the git commit and tag be signed?',
    type: 'boolean',
    default: getDefaults().sign,
  })
  .option('no-verify', {
    alias: 'n',
    describe: 'Bypass pre-commit or commit-msg git hooks during the commit phase',
    type: 'boolean',
    default: getDefaults().noVerify,
  })
  .option('commit-all', {
    alias: 'a',
    describe: 'Commit all staged changes, not just files affected by standard-version',
    type: 'boolean',
    default: getDefaults().commitAll,
  })
  .option('silent', {
    describe: 'Don\'t print logs and errors',
    type: 'boolean',
    default: getDefaults().silent,
  })
  .option('tag-prefix', {
    alias: 't',
    describe: 'Set a custom prefix for the git tag to be created',
    type: 'string',
    default: getDefaults().tagPrefix,
  })
  .option('scripts', {
    describe: 'Provide scripts to execute for lifecycle events (prebump, precommit, etc.,)',
    default: getDefaults().scripts,
  })
  .option('skip', {
    describe: 'Map of steps in the release process that should be skipped',
    default: getDefaults().skip,
  })
  .option('dry-run', {
    type: 'boolean',
    default: getDefaults().dryRun,
    describe: 'See the commands that running standard-version would run',
  })
  .option('git-tag-fallback', {
    type: 'boolean',
    default: getDefaults().gitTagFallback,
    describe: 'fallback to git tags for version, if no meta-information file is found (e.g., package.json)',
  })
  .option('path', {
    type: 'string',
    describe: 'Only populate commits made under this path',
  })
  .option('changelogHeader', {
    type: 'string',
    describe: '[DEPRECATED] Use a custom header when generating and updating changelog.\nThis option will be removed in the next major version, please use --header.',
  })
  .option('preset', {
    type: 'string',
    default: getDefaults().preset,
    describe: 'Commit message guideline preset',
  })
  .option('lerna-package', {
    type: 'string',
    describe: 'Name of the package from which the tags will be extracted',
  })
  .check((argv) => {
    if (typeof argv.scripts !== 'object' || Array.isArray(argv.scripts)) {
      throw Error('scripts must be an object');
    } else if (typeof argv.skip !== 'object' || Array.isArray(argv.skip)) {
      throw Error('skip must be an object');
    } else {
      return true;
    }
  })
  .alias('version', 'v')
  .alias('help', 'h')
  .example('$0', 'Update changelog and tag release')
  .example('$0 -m "%s: see changelog for details"', 'Update changelog and tag release with custom commit message')
  .pkgConf('standard-version')
  .config(getConfiguration())
  .wrap(97);

Object.keys(spec.properties).forEach((propertyKey) => {
  const property = spec.properties[propertyKey];
  const defaults = getDefaults() as any;
  command.option(propertyKey, {
    type: property.type,
    describe: property.description,
    default: defaults[propertyKey] ? defaults[propertyKey] : property.default,
    group: 'Preset Configuration:',
  });
});

export default command;
