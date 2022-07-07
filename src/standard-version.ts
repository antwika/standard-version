import fs from 'fs';
import path from 'path';
import { bump } from './lifecycles/bump';
import { changelog, START_OF_LAST_RELEASE_PATTERN } from './lifecycles/changelog';
import commit from './lifecycles/commit';
import { latestSemverTag } from './latest-semver-tag';
import printError from './print-error';
import { tag } from './lifecycles/tag';
import { resolveUpdaterObjectFromArgument } from './updaters';
import { getDefaults } from './defaults';

export type Args = {
  silent: boolean,
  verify?: boolean,
  n?: any,
  sign?: boolean,
  skip: {
    tag?: boolean,
    commit?: boolean,
    changelog?: boolean,
    bump?: boolean,
  },
  infile?: string,
  commitAll?: boolean,
  releaseCommitMessageFormat: string,
  tagPrefix: string,
  releaseAs?: string,
  firstRelease?: boolean,
  prerelease?: string,
  dryRun?: boolean,
  scripts?: Record<string, string>,
  m?: string,
  message?: string,
  changelogHeader?: string,
  header?: string,
  packageFiles: string[],
  gitTagFallback?: boolean,
  preset: Record<string, any>,
  bumpFiles: string[],
};

export const getPackage = async (args: Args) => {
  let pkg;
  for (const packageFile of args.packageFiles) {
    const updater = resolveUpdaterObjectFromArgument(packageFile);
    if (!updater || !updater.filename) break;
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
  return pkg;
};

export const standardVersion = async (argv: Args) => {
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

  if (argv.header?.search(START_OF_LAST_RELEASE_PATTERN) !== -1) {
    throw Error(`custom changelog header must not match ${START_OF_LAST_RELEASE_PATTERN}`);
  }

  const defaults = getDefaults();
  if (argv.packageFiles) {
    defaults.bumpFiles = { ...defaults.bumpFiles, ...argv.packageFiles };
  }

  const args = { ...defaults, ...argv };
  const pkg = await getPackage(args);

  try {
    if (!pkg && !args.gitTagFallback) {
      throw new Error('no package file found');
    }

    const version = pkg ? pkg.version : await latestSemverTag(args.tagPrefix);
    const newVersion = await bump(args, version);
    await changelog(args, newVersion);
    await commit(args, newVersion);
    await tag(newVersion, pkg ? pkg.private : false, args);
  } catch (err: any) {
    printError(args, err.message, 'error');
    throw err;
  }
};
