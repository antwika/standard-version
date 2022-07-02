const fs = require('fs');
const path = require('path');
const bump = require('./lifecycles/bump');
const changelog = require('./lifecycles/changelog');
const commit = require('./lifecycles/commit');
const latestSemverTag = require('./latest-semver-tag');
const printError = require('./print-error');
const tag = require('./lifecycles/tag');
const { resolveUpdaterObjectFromArgument } = require('./updaters');
const defaults = require('./defaults');

module.exports = async function standardVersion(argv) {
  /**
   * `--message` (`-m`) support will be removed in the next major version.
   */
  const message = argv.m || argv.message;
  if (message) {
    /**
     * The `--message` flag uses `%s` for version substitutions, we swap this
     * for the substitution defined in the config-spec for future-proofing upstream
     * handling.
     */
    // eslint-disable-next-line no-param-reassign
    argv.releaseCommitMessageFormat = message.replace(/%s/g, '{{currentTag}}');
    if (!argv.silent) {
      console.warn('[standard-version]: --message (-m) will be removed in the next major release. Use --releaseCommitMessageFormat.');
    }
  }

  if (argv.changelogHeader) {
    // eslint-disable-next-line no-param-reassign
    argv.header = argv.changelogHeader;
    if (!argv.silent) {
      console.warn('[standard-version]: --changelogHeader will be removed in the next major release. Use --header.');
    }
  }

  if (argv.header && argv.header.search(changelog.START_OF_LAST_RELEASE_PATTERN) !== -1) {
    throw Error(`custom changelog header must not match ${changelog.START_OF_LAST_RELEASE_PATTERN}`);
  }

  /**
   * If an argument for `packageFiles` provided, we include it as a "default" `bumpFile`.
   */
  if (argv.packageFiles) {
    defaults.bumpFiles = defaults.bumpFiles.concat(argv.packageFiles);
  }

  const args = { ...defaults, ...argv };
  let pkg;
  for (const packageFile of args.packageFiles) {
    const updater = resolveUpdaterObjectFromArgument(packageFile);
    if (!updater) return;
    const pkgPath = path.resolve(process.cwd(), updater.filename);
    try {
      const contents = fs.readFileSync(pkgPath, 'utf8');
      pkg = {
        version: updater.updater.readVersion(contents),
        private: typeof updater.updater.isPrivate === 'function' ? updater.updater.isPrivate(contents) : false,
      };
      break;
    } catch (err) {
      console.warn(`Error thrown while trying to read package path ${pkgPath} ... Is this expected?`);
    }
  }

  try {
    let version;
    if (pkg) {
      version = pkg.version;
    } else if (args.gitTagFallback) {
      version = await latestSemverTag(args.tagPrefix);
    } else {
      throw new Error('no package file found');
    }

    const newVersion = await bump(args, version);
    await changelog(args, newVersion);
    await commit(args, newVersion);
    await tag(newVersion, pkg ? pkg.private : false, args);
  } catch (err) {
    printError(args, err.message);
    throw err;
  }
};
