import fs from 'fs';
import path from 'path';
import { bump } from './lifecycles/bump';
import { changelog, START_OF_LAST_RELEASE_PATTERN } from './lifecycles/changelog';
import commit from './lifecycles/commit';
import latestSemverTag from './latest-semver-tag';
import printError from './print-error';
import tag from './lifecycles/tag';
import { resolveUpdaterObjectFromArgument } from './updaters';
import { getDefaults } from './defaults';

const standardVersion = async (argv: any) => {
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

  if (argv.header && argv.header.search(START_OF_LAST_RELEASE_PATTERN) !== -1) {
    throw Error(`custom changelog header must not match ${START_OF_LAST_RELEASE_PATTERN}`);
  }

  const defaults = getDefaults();
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
    if (!updater.filename) return;
    const pkgPath = path.resolve(process.cwd(), updater.filename);
    try {
      const contents = fs.readFileSync(pkgPath, 'utf8');
      pkg = {
        version: updater.readVersion(contents),
        private: typeof updater.isPrivate === 'function' ? updater.isPrivate(contents) : false,
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
  } catch (err: any) {
    printError(args, err.message);
    throw err;
  }
};

export default standardVersion;
